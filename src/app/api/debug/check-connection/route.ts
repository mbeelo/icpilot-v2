import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Extract hostname from database URL
    const dbHostname = dbUrl ? new URL(dbUrl).hostname : 'Not set';

    return NextResponse.json({
      databaseHostname: dbHostname,
      supabaseUrl: supabaseUrl,
      hasDbUrl: !!dbUrl,
      hasSupabaseUrl: !!supabaseUrl
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check connection details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}