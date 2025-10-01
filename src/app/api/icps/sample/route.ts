import { NextRequest, NextResponse } from 'next/server';
import { db, icps } from '@/db';
import { getCurrentUser } from '@/lib/session';
import { SAMPLE_ICP } from '@/lib/sample-data';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the sample ICP for this user
    const sampleIcpData = {
      userId: user.id,
      name: SAMPLE_ICP.name,
      industry: SAMPLE_ICP.industry,
      companySize: SAMPLE_ICP.companySize,
      role: SAMPLE_ICP.role,
      painPoints: SAMPLE_ICP.painPoints,
      outcomes: SAMPLE_ICP.outcomes,
      triggers: SAMPLE_ICP.triggers,
      dealKillers: SAMPLE_ICP.dealKillers,
      companyName: SAMPLE_ICP.companyName,
      productService: SAMPLE_ICP.productService,
      valueProposition: SAMPLE_ICP.valueProposition,
      keyDifferentiators: SAMPLE_ICP.keyDifferentiators,
    };

    const [newIcp] = await db.insert(icps).values(sampleIcpData).returning();

    return NextResponse.json({
      success: true,
      icp: newIcp
    });
  } catch (error) {
    console.error('Error creating sample ICP:', error);
    return NextResponse.json({ error: 'Failed to create sample ICP' }, { status: 500 });
  }
}