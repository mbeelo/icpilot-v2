import { NextRequest, NextResponse } from 'next/server';
import { db, outputs } from '@/db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(outputs).where(eq(outputs.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting output:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}