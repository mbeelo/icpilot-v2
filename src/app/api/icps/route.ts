import { NextRequest, NextResponse } from 'next/server';
import { db, icps } from '@/db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ICPs for the authenticated user only
    const userIcps = await db.select().from(icps).where(eq(icps.userId, user.id));
    
    return NextResponse.json({ success: true, icps: userIcps });
  } catch (error) {
    console.error('Error fetching ICPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ICPs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const newIcp = await db.insert(icps).values({
      userId: user.id,
      name: body.name,
      industry: body.industry,
      companySize: body.companySize,
      role: body.role,
      painPoints: body.painPoints ? body.painPoints.split(',').map((p: string) => p.trim()).filter(Boolean) : [],
      outcomes: body.outcomes ? body.outcomes.split(',').map((o: string) => o.trim()).filter(Boolean) : [],
      triggers: body.triggers ? body.triggers.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      dealKillers: [],
      // New company/value prop fields
      companyName: body.companyName,
      productService: body.productService,
      valueProposition: body.valueProposition,
      keyDifferentiators: body.keyDifferentiators ? body.keyDifferentiators.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
    }).returning();
    
    return NextResponse.json({ success: true, icp: newIcp[0] });
  } catch (error) {
    console.error('Error saving ICP:', error);
    return NextResponse.json(
      {
        error: 'Failed to save ICP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}