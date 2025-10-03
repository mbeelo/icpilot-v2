import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results = [];

    // Test different array formats that PostgreSQL accepts
    const arrayFormats = [
      "'{\"item1\",\"item2\"}'",  // PostgreSQL array syntax
      "'[\"item1\",\"item2\"]'", // JSON array syntax (should fail)
      "ARRAY['item1','item2']",  // ARRAY constructor
    ];

    for (const format of arrayFormats) {
      try {
        const testResult = await db.execute(sql.raw(`SELECT ${format} as test_array`));
        results.push({ format, success: true, result: testResult });
      } catch (error) {
        results.push({ format, success: false, error: error instanceof Error ? error.message : 'Unknown' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Array format test completed',
      results
    });
  } catch (error) {
    console.error('Array format test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}