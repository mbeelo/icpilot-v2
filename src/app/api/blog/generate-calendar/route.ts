import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentCalendar } from '@/db/schema';
import { analyzeICPPilotMarket, generateKeywordStrategy, generateICPPilotContentCalendar } from '@/lib/blog-ai-demo';

export async function POST(request: NextRequest) {
  try {
    // Check for admin key (set in environment for security)
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forceGenerate = false } = await request.json().catch(() => ({}));

    // Check for existing calendar and prevent conflicts
    const existingCalendar = await db.select().from(contentCalendar);

    if (existingCalendar.length > 0 && !forceGenerate) {
      // Filter out items without scheduled dates and handle null values
      const validScheduledDates = existingCalendar
        .filter(item => item.scheduledDate !== null)
        .map(item => new Date(item.scheduledDate!).getTime());

      if (validScheduledDates.length > 0) {
        const lastScheduledDate = Math.max(...validScheduledDates);
        const daysSinceLastPost = (Date.now() - lastScheduledDate) / (1000 * 60 * 60 * 24);

        if (daysSinceLastPost < 1) {
          return NextResponse.json({
            error: 'Calendar conflict detected',
            message: 'A content calendar already exists with future dates. Use forceGenerate to override.',
            existingCalendar: {
              count: existingCalendar.length,
              dateRange: {
                start: new Date(Math.min(...validScheduledDates)).toLocaleDateString(),
                end: new Date(lastScheduledDate).toLocaleDateString()
              },
              pendingItems: existingCalendar.filter(item => item.status === 'planned').length
            }
          }, { status: 409 });
        }
      }
    }

    console.log('Starting ICP Pilot market analysis...');
    const analysis = await analyzeICPPilotMarket();

    console.log('Generating strategic keyword research...');
    const keywords = await generateKeywordStrategy();

    console.log('Generating ICP Pilot content calendar...');
    const calendar = await generateICPPilotContentCalendar(analysis, keywords);

    console.log(`Generated ${calendar.length} content ideas`);

    // Calculate start date for new calendar (after existing calendar ends)
    let startDate = new Date();
    if (existingCalendar.length > 0) {
      const validScheduledDates = existingCalendar
        .filter(item => item.scheduledDate !== null)
        .map(item => new Date(item.scheduledDate!).getTime());

      if (validScheduledDates.length > 0) {
        const lastDate = Math.max(...validScheduledDates);
        startDate = new Date(lastDate + 86400000); // Start day after last scheduled post
      }
    }

    // Save to database with sequential dates
    const calendarItems = calendar.map((item, index) => {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + index);

      return {
        title: item.title,
        category: item.category,
        targetKeywords: JSON.stringify(item.targetKeywords),
        contentBrief: item.contentBrief,
        targetAudience: item.targetAudience,
        contentType: item.contentType,
        priority: item.priority,
        scheduledDate,
      };
    });

    const result = await db.insert(contentCalendar).values(calendarItems).returning();

    return NextResponse.json({
      success: true,
      analysis,
      calendar: result,
      calendarPeriod: {
        start: startDate.toLocaleDateString(),
        end: new Date(startDate.getTime() + (calendar.length - 1) * 86400000).toLocaleDateString()
      },
      message: `Generated ${result.length} content calendar items`
    });

  } catch (error) {
    console.error('Error generating content calendar:', error);
    return NextResponse.json({ error: 'Failed to generate content calendar' }, { status: 500 });
  }
}