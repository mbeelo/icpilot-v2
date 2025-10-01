import { NextRequest, NextResponse } from 'next/server';
import { getSREStatus, getSystemHealth } from '@/lib/sre';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For security, only allow admin users to access SRE dashboard
    // You might want to add an isAdmin field to your user schema
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const dashboard = await getSREStatus();
    const systemHealth = await getSystemHealth();

    return NextResponse.json({
      dashboard,
      systemHealth,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error fetching SRE dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SRE dashboard' },
      { status: 500 }
    );
  }
}