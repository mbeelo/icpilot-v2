import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check if there's any data in outputs table
    const outputsCount = await db.execute(sql`SELECT COUNT(*) as count FROM outputs`);
    results.push({ name: 'outputs table count', count: outputsCount });

    // Sample a few records to see the structure
    const sampleOutputs = await db.execute(sql`
      SELECT id, type, title, content, input, output
      FROM outputs
      LIMIT 3
    `);
    results.push({ name: 'sample outputs', data: sampleOutputs });

    return NextResponse.json({
      success: true,
      message: 'Outputs data check completed',
      results
    });
  } catch (error) {
    console.error('Outputs data check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}