import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentCalendar, blogPosts } from '@/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { analyzeICPPilotMarket, generateICPPilotBlogPost } from '@/lib/blog-ai-demo';

export async function POST(request: NextRequest) {
  try {
    // Check for admin key (set in environment for security)
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { calendarItemIds, batchSize = 1 } = await request.json(); // Quality-first: one at a time

    // Get ICP Pilot market analysis
    const analysis = await analyzeICPPilotMarket();

    // If no specific IDs provided, get pending calendar items
    console.log('Looking for calendar items with calendarItemIds:', calendarItemIds);

    let calendarItems;
    if (calendarItemIds && calendarItemIds.length > 0) {
      console.log('Using specific calendar item IDs:', calendarItemIds);
      calendarItems = await db.select()
        .from(contentCalendar)
        .where(and(
          eq(contentCalendar.status, 'planned'),
          isNull(contentCalendar.blogPostId),
          inArray(contentCalendar.id, calendarItemIds)
        ))
        .limit(batchSize);
    } else {
      console.log('Searching for any planned calendar items');
      calendarItems = await db.select()
        .from(contentCalendar)
        .where(and(
          eq(contentCalendar.status, 'planned'),
          isNull(contentCalendar.blogPostId)
        ))
        .orderBy(contentCalendar.scheduledDate)
        .limit(batchSize);
    }

    console.log(`Found ${calendarItems.length} calendar items:`, calendarItems.map(item => ({ id: item.id, title: item.title, status: item.status, blogPostId: item.blogPostId })));

    if (calendarItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending content calendar items found',
        postsGenerated: 0
      });
    }

    console.log(`Generating ${calendarItems.length} blog posts...`);

    const generatedPosts = [];

    for (const item of calendarItems) {
      try {
        console.log(`Generating post for: ${item.title}`);

        // Update status to in-progress
        await db.update(contentCalendar)
          .set({ status: 'in-progress', updatedAt: new Date() })
          .where(eq(contentCalendar.id, item.id));

        // Generate high-quality blog post with ICP Pilot expertise
        const blogContent = await generateICPPilotBlogPost(
          {
            title: item.title,
            category: item.category,
            targetKeywords: typeof item.targetKeywords === 'string'
              ? JSON.parse(item.targetKeywords)
              : item.targetKeywords || [],
            contentBrief: item.contentBrief,
            targetAudience: item.targetAudience || '',
            contentType: item.contentType,
            priority: item.priority as 'high' | 'medium' | 'low',
            scheduledDate: item.scheduledDate?.toISOString() || new Date().toISOString()
          },
          analysis
        );

        // Create slug from title
        const slug = blogContent.slug || blogContent.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Parse reading time to ensure it's a number
        let readingTime = 5; // default
        if (blogContent.readingTime !== undefined && blogContent.readingTime !== null) {
          if (typeof blogContent.readingTime === 'number') {
            readingTime = blogContent.readingTime;
          } else {
            // Handle string reading time - extract number from strings like "10 minutes", "5 min", etc.
            const readingTimeStr = String(blogContent.readingTime);
            const match = readingTimeStr.match(/\d+/);
            readingTime = match ? parseInt(match[0]) : 5;
          }
        }

        // Validate and truncate field lengths to match database constraints
        const validateAndTruncate = (str: string | undefined, maxLength: number) => {
          if (!str) return '';
          return str.length > maxLength ? str.substring(0, maxLength) : str;
        };

        console.log('Blog content before DB insert:', {
          title: blogContent.title?.substring(0, 50) + '...',
          readingTime,
          readingTimeOriginal: blogContent.readingTime,
          metaTitleLength: blogContent.metaTitle?.length,
          metaDescriptionLength: blogContent.metaDescription?.length
        });

        // Save blog post to database
        const [newPost] = await db.insert(blogPosts).values({
          title: validateAndTruncate(blogContent.title, 255),
          slug,
          excerpt: validateAndTruncate(blogContent.excerpt, 500),
          content: blogContent.content || '',
          metaTitle: validateAndTruncate(blogContent.metaTitle, 60),
          metaDescription: validateAndTruncate(blogContent.metaDescription, 160),
          targetKeywords: JSON.stringify(blogContent.targetKeywords || []),
          category: validateAndTruncate(blogContent.category || item.category, 100),
          tags: JSON.stringify(blogContent.tags || []),
          readingTime,
          isPublished: false, // Don't auto-publish, allow manual review
          approvalStatus: 'pending', // Set initial approval status
        }).returning();

        // Update calendar item with blog post reference
        await db.update(contentCalendar)
          .set({
            status: 'completed',
            blogPostId: newPost.id,
            updatedAt: new Date()
          })
          .where(eq(contentCalendar.id, item.id));

        generatedPosts.push({
          calendarItem: item,
          blogPost: newPost,
          wordCount: blogContent.content?.length || 0
        });

        console.log(`✅ Generated post: ${blogContent.title}`);

        // Add delay between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error generating post for ${item.title}:`, error);

        // Reset status back to planned on error
        await db.update(contentCalendar)
          .set({ status: 'planned', updatedAt: new Date() })
          .where(eq(contentCalendar.id, item.id));
      }
    }

    return NextResponse.json({
      success: true,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts,
      message: `Successfully generated ${generatedPosts.length} blog posts`
    });

  } catch (error) {
    console.error('Error generating blog posts:', error);
    return NextResponse.json({ error: 'Failed to generate blog posts' }, { status: 500 });
  }
}