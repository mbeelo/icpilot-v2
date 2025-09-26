import { NextRequest, NextResponse } from 'next/server';
import { db, icps, outputs, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateMessages } from '@/lib/openai';
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

    const { icpId, messageType, trigger, prospectInfo } = await request.json();
    
    const icp = await db.select().from(icps).where(eq(icps.id, icpId)).limit(1);
    
    if (!icp.length) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }
    
    const icpData = icp[0];
    const messages = await generateMessages(icpData, messageType, trigger, prospectInfo);
    
    // Auto-save first message variant to library
    await db.insert(outputs).values({
      userId: user.id,
      icpId: icpId,
      type: 'message',
      title: `${messageType}: ${messages[0].subject}`,
      input: { messageType, trigger, prospectInfo },
      output: messages[0],
    });
    
    // Increment messages counter
await db.update(users)
  .set({ messagesGenerated: user.messagesGenerated + 1 })
  .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error generating messages:', error);
    return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
  }
}
