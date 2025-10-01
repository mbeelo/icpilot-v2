import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for admin key
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, adminNotes, assignedTo, resolvedAt } = await request.json();
    const { id: requestId } = await params;

    // Get the current request
    const [currentRequest] = await db.select()
      .from(supportRequests)
      .where(eq(supportRequests.id, requestId));

    if (!currentRequest) {
      return NextResponse.json({ error: 'Support request not found' }, { status: 404 });
    }

    // Update the request
    const updateData: {
      updatedAt: Date;
      status?: string;
      adminNotes?: string;
      assignedTo?: string;
      resolvedAt?: Date;
    } = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolvedAt) updateData.resolvedAt = new Date(resolvedAt);

    await db.update(supportRequests)
      .set(updateData)
      .where(eq(supportRequests.id, requestId));

    return NextResponse.json({
      success: true,
      message: 'Support request updated successfully'
    });

  } catch (error) {
    console.error('Error updating support request:', error);
    return NextResponse.json({ error: 'Failed to update support request' }, { status: 500 });
  }
}