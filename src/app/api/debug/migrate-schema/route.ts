import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // Add the missing input column to outputs table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input jsonb;
    `);

    // Verify the column was added
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND column_name = 'input';
    `);

    return NextResponse.json({
      success: true,
      message: 'Schema migration completed',
      verification: result
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}