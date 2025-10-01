import { NextRequest, NextResponse } from 'next/server';
import { db, outputs } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const newOutput = await db.insert(outputs).values({
      userId: user.id,
      icpId: body.icpId,
      type: body.type,
      title: body.title,
      input: body.input,
      output: body.output,
    }).returning();

    return NextResponse.json({ success: true, output: newOutput[0] });
  } catch (error) {
    console.error('Error saving output:', error);
    return NextResponse.json(
      { error: 'Failed to save output', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get only saved outputs for the authenticated user (limited to recent 50)
    const userOutputs = await db.select().from(outputs).where(and(
      eq(outputs.userId, user.id),
      eq(outputs.isSaved, true)
    )).orderBy(desc(outputs.createdAt)).limit(50);
    
    return NextResponse.json({ success: true, outputs: userOutputs });
  } catch (error) {
    console.error('Error fetching outputs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outputs' },
      { status: 500 }
    );
  }
}