import { NextRequest, NextResponse } from 'next/server';
import { db, icps } from '@/db';
import { eq, and } from 'drizzle-orm';
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

    // Delete the ICP (only if it belongs to the user)
    await db.delete(icps)
      .where(and(eq(icps.id, id), eq(icps.userId, user.id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ICP:', error);
    return NextResponse.json(
      { error: 'Failed to delete ICP' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    const updatedIcp = await db.update(icps)
      .set({
        name: body.name,
        industry: body.industry,
        companySize: body.companySize,
        role: body.role,
        painPoints: body.painPoints ? body.painPoints.split(',').map((p: string) => p.trim()).filter(Boolean) : [],
        outcomes: body.outcomes ? body.outcomes.split(',').map((o: string) => o.trim()).filter(Boolean) : [],
        triggers: body.triggers ? body.triggers.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        companyName: body.companyName,
        productService: body.productService,
        valueProposition: body.valueProposition,
        keyDifferentiators: body.keyDifferentiators ? body.keyDifferentiators.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
        updatedAt: new Date(),
      })
      .where(and(eq(icps.id, id), eq(icps.userId, user.id)))
      .returning();
    
    return NextResponse.json({ success: true, icp: updatedIcp[0] });
  } catch (error) {
    console.error('Error updating ICP:', error);
    return NextResponse.json(
      { error: 'Failed to update ICP' },
      { status: 500 }
    );
  }
}