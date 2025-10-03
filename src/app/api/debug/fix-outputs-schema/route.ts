import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check current outputs table structure
    const outputsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Current outputs columns', columns: outputsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    // Add missing output column (JSONB)
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS output JSONB NOT NULL DEFAULT '{}'`);
      results.push({ name: 'Add output column to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add output column to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Add missing is_favorite column (BOOLEAN)
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE`);
      results.push({ name: 'Add is_favorite column to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add is_favorite column to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Add missing is_saved column (BOOLEAN)
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE`);
      results.push({ name: 'Add is_saved column to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add is_saved column to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Add missing is_temporary column (BOOLEAN)
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT TRUE`);
      results.push({ name: 'Add is_temporary column to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add is_temporary column to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Add missing session_id column (VARCHAR)
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255)`);
      results.push({ name: 'Add session_id column to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add session_id column to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Check final structure
    const finalOutputsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Final outputs columns', columns: finalOutputsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    return NextResponse.json({
      success: true,
      message: 'Outputs table schema fix completed',
      results
    });
  } catch (error) {
    console.error('Outputs schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}