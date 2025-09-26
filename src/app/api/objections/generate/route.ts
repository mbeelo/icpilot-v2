import { NextRequest, NextResponse } from 'next/server';
import { db, icps, outputs, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateObjectionRebuttal } from '@/lib/openai';
import { getCurrentUser } from '@/lib/session';
import { checkAndIncrementUsage } from '@/lib/usage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check usage limits and increment
    const usageCheck = await checkAndIncrementUsage(user.id, user.subscriptionTier, user.usageCount);
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.error }, { status: 402 });
    }

    const { icpId, objection, prospectInfo } = await request.json();
    
    const icp = await db.select().from(icps).where(eq(icps.id, icpId)).limit(1);
    
    if (!icp.length) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }
    
    const icpData = icp[0];
    const rebuttal = await generateObjectionRebuttal(icpData, objection, prospectInfo);
    
    // Auto-save to library
    await db.insert(outputs).values({
      userId: user.id,
      icpId: icpId,
      type: 'objection',
      title: `Objection: "${objection}"`,
      input: { objection, prospectInfo },
      output: rebuttal,
    });
    // Increment objections counter
await db.update(users)
  .set({ objectionsGenerated: user.objectionsGenerated + 1 })
  .where(eq(users.id, user.id));
  
    return NextResponse.json({ success: true, rebuttal });
  } catch (error) {
    console.error('Error generating rebuttal:', error);
    return NextResponse.json({ error: 'Failed to generate rebuttal' }, { status: 500 });
  }
}
