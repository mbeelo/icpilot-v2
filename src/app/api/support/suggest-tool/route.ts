import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { supportRequests } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { toolName, description, useCase, priority, email } = await request.json();

    // Basic validation
    if (!toolName || !description || !useCase) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save to database
    const [newRequest] = await db.insert(supportRequests).values({
      type: 'tool_suggestion',
      title: `Tool Suggestion: ${toolName}`,
      description,
      priority: priority || 'medium',
      status: 'open',

      // User info
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || email || null,

      // Tool suggestion specific fields
      toolName,
      useCase,

      // Environment info
      userAgent: request.headers.get('user-agent'),
    }).returning();

    // Optional: Log for immediate visibility during development
    console.log('Tool Suggestion Saved:', {
      id: newRequest.id,
      toolName,
      user: user?.name || 'anonymous',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Tool suggestion submitted successfully',
      requestId: newRequest.id
    });

  } catch (error) {
    console.error('Error submitting tool suggestion:', error);
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 });
  }
}