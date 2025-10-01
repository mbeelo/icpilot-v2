import { NextRequest, NextResponse } from 'next/server';
import { launchReadinessAgent } from '@/lib/sre';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = await launchReadinessAgent.performHealthCheck();

    // Set appropriate cache headers for health checks
    const response = NextResponse.json({
      ...healthCheck,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });

    // Cache for 30 seconds to reduce load
    response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30');

    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        overallHealth: 'unhealthy',
        services: [],
        issues: ['Health check system failure'],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}