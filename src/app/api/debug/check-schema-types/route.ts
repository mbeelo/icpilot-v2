import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check actual data types for the problematic columns
    const icpsSchema = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'icps' AND table_schema = 'public'
      AND column_name IN ('pain_points', 'outcomes', 'triggers', 'key_differentiators')
      ORDER BY column_name
    `);
    results.push({ name: 'ICPs problematic columns schema', columns: icpsSchema });

    // Check a sample record to see what format the data is in
    const sampleIcp = await db.execute(sql`
      SELECT pain_points, outcomes, triggers, key_differentiators
      FROM icps
      WHERE pain_points IS NOT NULL
      LIMIT 1
    `);
    results.push({ name: 'Sample ICP data format', data: sampleIcp });

    return NextResponse.json({
      success: true,
      message: 'Schema type check completed',
      results
    });
  } catch (error) {
    console.error('Schema type check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}