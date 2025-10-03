import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check data type for deal_killers column specifically
    const dealKillersSchema = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'icps' AND table_schema = 'public'
      AND column_name = 'deal_killers'
    `);
    results.push({ name: 'deal_killers column schema', column: dealKillersSchema });

    return NextResponse.json({
      success: true,
      message: 'Deal killers schema check completed',
      results
    });
  } catch (error) {
    console.error('Deal killers schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}