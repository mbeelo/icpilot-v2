import { NextRequest, NextResponse } from 'next/server';
import { db, icps } from '@/db';
import { eq, sql } from 'drizzle-orm';
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
    
    // Helper function to safely parse array data
    const parseArrayField = (field: unknown): string[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // Fall back to comma-separated string
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Convert arrays to PostgreSQL format using sql.raw
    const painPointsArray = parseArrayField(body.painPoints);
    const outcomesArray = parseArrayField(body.outcomes);
    const triggersArray = parseArrayField(body.triggers);
    const dealKillersArray = parseArrayField(body.dealKillers);
    const keyDifferentiatorsArray = parseArrayField(body.keyDifferentiators);

    // Use manual SQL query with proper array handling
    const newIcp = await db.execute(sql`
      INSERT INTO icps (user_id, name, industry, company_size, role, pain_points, outcomes, triggers, deal_killers, company_name, product_service, value_proposition, key_differentiators)
      VALUES (
        ${user.id},
        ${body.name},
        ${body.industry},
        ${body.companySize},
        ${body.role},
        ${painPointsArray.length > 0 ? sql.raw(`ARRAY[${painPointsArray.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]`) : sql`ARRAY[]::text[]`},
        ${outcomesArray.length > 0 ? sql.raw(`ARRAY[${outcomesArray.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]`) : sql`ARRAY[]::text[]`},
        ${triggersArray.length > 0 ? sql.raw(`ARRAY[${triggersArray.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]`) : sql`ARRAY[]::text[]`},
        ${dealKillersArray.length > 0 ? sql.raw(`ARRAY[${dealKillersArray.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]`) : sql`ARRAY[]::text[]`},
        ${body.companyName},
        ${body.productService},
        ${body.valueProposition},
        ${keyDifferentiatorsArray.length > 0 ? sql.raw(`ARRAY[${keyDifferentiatorsArray.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]`) : sql`ARRAY[]::text[]`}
      )
      RETURNING *
    `);
    
    // Return the newly created ICP
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