import { NextRequest, NextResponse } from 'next/server';
import { db, icps, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateObjectionRebuttal } from '@/lib/openai';
import { getCurrentUser } from '@/lib/session';
import { checkAndIncrementUsage } from '@/lib/usage';
import { saveTempOutput } from '@/lib/session-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check usage limits and increment
    const usageCheck = await checkAndIncrementUsage(user.id, user.subscriptionTier || 'free', user.usageCount || 0);
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.error }, { status: 402 });
    }

    const { icpId, objection, objectionType, prospectInfo, salesContext } = await request.json();

    const icp = await db.select().from(icps).where(eq(icps.id, icpId)).limit(1);

    if (!icp.length) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }

    const icpData = {
      ...icp[0],
      industry: icp[0].industry || '',
      companySize: icp[0].companySize || '',
      role: icp[0].role || '',
      painPoints: Array.isArray(icp[0].painPoints) ? icp[0].painPoints : [],
      outcomes: Array.isArray(icp[0].outcomes) ? icp[0].outcomes : [],
      triggers: Array.isArray(icp[0].triggers) ? icp[0].triggers : [],
      companyName: icp[0].companyName || undefined,
      productService: icp[0].productService || undefined,
      valueProposition: icp[0].valueProposition || undefined,
      keyDifferentiators: icp[0].keyDifferentiators || undefined,
    };

    const rebuttal = await generateObjectionRebuttal(icpData, objection, prospectInfo, objectionType, salesContext);

    // Auto-save as temporary output (session-based)
    const savedOutput = await saveTempOutput(
      user.id,
      icpId,
      'objection',
      `Objection: "${objection}"`,
      { objection, objectionType, prospectInfo, salesContext },
      rebuttal
    );
    // Increment objections counter
await db.update(users)
  .set({ objectionsGenerated: (user.objectionsGenerated || 0) + 1 })
  .where(eq(users.id, user.id));
  
    return NextResponse.json({
      success: true,
      rebuttal,
      savedOutput: {
        id: savedOutput.id,
        rebuttal
      }
    });
  } catch (error) {
    console.error('Error generating rebuttal:', error);
    return NextResponse.json({ error: 'Failed to generate rebuttal' }, { status: 500 });
  }
}
