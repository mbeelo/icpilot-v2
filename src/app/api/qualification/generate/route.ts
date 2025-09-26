import { NextRequest, NextResponse } from 'next/server';
import { db, icps, outputs, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateQualificationFramework } from '@/lib/openai';
import { getCurrentUser } from '@/lib/session';
import { checkAndIncrementUsage } from '@/lib/usage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check usage limits
    const usageCheck = await checkAndIncrementUsage(user.id, user.subscriptionTier, user.usageCount);
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.error }, { status: 402 });
    }

    const { icpId, frameworkType, customContext, prospectInfo } = await request.json();
    
    const icp = await db.select().from(icps).where(eq(icps.id, icpId)).limit(1);
    
    if (!icp.length) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }
    
    const icpData = icp[0];
    const framework = await generateQualificationFramework(icpData, frameworkType, customContext);
    
    // Auto-save to library
    await db.insert(outputs).values({
      userId: user.id,
      icpId: icpId,
      type: 'framework',
      title: `${frameworkType} Framework`,
      input: { frameworkType, customContext, prospectInfo },
      output: framework,
    });
    
    // Increment frameworks counter
await db.update(users)
  .set({ frameworksGenerated: user.frameworksGenerated + 1 })
  .where(eq(users.id, user.id));
  
    return NextResponse.json({ success: true, framework });
  } catch (error) {
    console.error('Error generating framework:', error);
    return NextResponse.json({ error: 'Failed to generate framework' }, { status: 500 });
  }
}
