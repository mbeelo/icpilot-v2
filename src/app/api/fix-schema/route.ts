import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Check current icps table structure
    const icpsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'icps' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Current icps columns', columns: icpsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    // Check current outputs table structure
    const outputsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Current outputs columns', columns: outputsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    // Add missing is_active column to icps table
    try {
      await db.execute(sql`ALTER TABLE icps ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
      results.push({ name: 'Add is_active to icps', success: true });
    } catch (error) {
      results.push({ name: 'Add is_active to icps', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Add missing input column to outputs table
    try {
      await db.execute(sql`ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}'`);
      results.push({ name: 'Add input to outputs', success: true });
    } catch (error) {
      results.push({ name: 'Add input to outputs', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Check final structure
    const finalIcpsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'icps' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Final icps columns', columns: finalIcpsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    const finalOutputsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'outputs' AND table_schema = 'public'
      ORDER BY column_name
    `);
    results.push({ name: 'Final outputs columns', columns: finalOutputsColumns.map(col => `${col.column_name} (${col.data_type})`) });

    return NextResponse.json({
      success: true,
      message: 'Schema fix completed',
      results
    });
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}