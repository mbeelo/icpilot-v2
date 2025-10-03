import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST() {
  try {
    console.log('🔧 Starting database schema migration...');

    // Use direct postgres client to execute schema changes
    const connectionString = process.env.DATABASE_URL!;
    const client = postgres(connectionString, {
      prepare: false,
      ssl: { rejectUnauthorized: false }
    });

    // Add missing columns using direct SQL
    const migrations = [
      {
        name: 'Add is_active column to icps table',
        query: 'ALTER TABLE icps ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;'
      },
      {
        name: 'Add input column to outputs table',
        query: `ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}';`
      },
      {
        name: 'Update existing outputs with valid input data',
        query: `UPDATE outputs SET input = '{}' WHERE input IS NULL;`
      }
    ];

    const results = [];
    for (const migration of migrations) {
      try {
        console.log(`🔧 Executing: ${migration.name}`);
        const result = await client.unsafe(migration.query);
        results.push({ name: migration.name, success: true, result });
        console.log(`✅ Success: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${migration.name}`, error);
        results.push({
          name: migration.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Close the connection
    await client.end();

    console.log('🎉 Migration completed');
    return NextResponse.json({
      success: true,
      message: 'Database schema migration completed',
      results
    });

  } catch (error) {
    console.error('💥 Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}