import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Drop the content column that's not in our schema but exists in the database
    await db.execute(sql`
      ALTER TABLE outputs DROP COLUMN IF EXISTS content
    `);
    results.push({ name: 'dropped content column', success: true });

    // Verify the column structure now
    const updatedSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    results.push({ name: 'updated outputs schema', columns: updatedSchema });

    return NextResponse.json({
      success: true,
      message: 'Outputs content column fix completed',
      results
    });
  } catch (error) {
    console.error('Outputs content column fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}