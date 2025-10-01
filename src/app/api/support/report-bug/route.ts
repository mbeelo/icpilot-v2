import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { supportRequests } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const {
      title,
      description,
      steps,
      expected,
      actual,
      severity,
      email,
      browser,
      device
    } = await request.json();

    // Basic validation
    if (!title || !description || !steps || !expected || !actual) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine priority based on severity
    let priority = 'medium';
    if (severity === 'critical') priority = 'critical';
    else if (severity === 'high') priority = 'high';
    else if (severity === 'low') priority = 'low';

    // Save to database
    const [newRequest] = await db.insert(supportRequests).values({
      type: 'bug_report',
      title: `Bug Report: ${title}`,
      description,
      priority,
      status: 'open',

      // User info
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || email || null,

      // Bug report specific fields
      stepsToReproduce: steps,
      expectedResult: expected,
      actualResult: actual,
      severity: severity || 'medium',
      browser,
      device,

      // Environment info
      userAgent: request.headers.get('user-agent'),
    }).returning();

    // Optional: Log for immediate visibility during development
    console.log('Bug Report Saved:', {
      id: newRequest.id,
      title,
      severity,
      user: user?.name || 'anonymous',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted successfully',
      requestId: newRequest.id
    });

  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
  }
}