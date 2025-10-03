import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check actual outputs table columns
    const outputsSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    results.push({ name: 'outputs table columns', columns: outputsSchema });

    return NextResponse.json({
      success: true,
      message: 'Outputs schema check completed',
      results
    });
  } catch (error) {
    console.error('Outputs schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}