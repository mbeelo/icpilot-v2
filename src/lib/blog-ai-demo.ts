import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WebsiteAnalysis {
  productName: string;
  primaryValue: string;
  targetAudience: string;
  keyFeatures: string[];
  painPointsSolved: string[];
  industryContext: string;
  competitiveAdvantages: string[];
  contentThemes: string[];
  conversionKeywords: string[];
}

interface ContentCalendarItem {
  title: string;
  category: string;
  targetKeywords: string[];
  contentBrief: string;
  targetAudience: string;
  contentType: string;
  priority: 'high' | 'medium' | 'low';
  scheduledDate: string;
}

interface BlogPostContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  category: string;
  tags: string[];
  readingTime: number;
}

// Quick demo function to generate ICP Pilot market analysis
export async function analyzeICPPilotMarket(): Promise<WebsiteAnalysis> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 2000,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `You are the CMO of ICP Pilot with 20+ years experience building category-defining B2B SaaS companies. Analyze ICP Pilot's market position for our content strategy.

Return strategic analysis as JSON with:
- productName: "ICP Pilot"
- primaryValue: unique value proposition
- targetAudience: specific personas
- keyFeatures: features that solve real problems
- painPointsSolved: specific problems we solve
- industryContext: our position in sales enablement
- competitiveAdvantages: what makes us category-defining
- contentThemes: 5 core themes for thought leadership
- conversionKeywords: 10 high-intent keywords`,
      },
      {
        role: 'user',
        content: `ICP Pilot Context:
- B2B sales enablement platform revolutionizing sales methodology implementation
- Solutions: ICP Builder, Objection Killer, Message Generator, Qualification Framework
- We solve: Manual content creation, inconsistent messaging, poor qualification
- We save: 15+ min per objection, 20+ min per message, 45+ min per framework
- Our edge: Methodology-first approach using proven frameworks (Sandler, Challenger, SPIN)
- Target: Sales teams, BDRs, AEs, Sales Managers at B2B companies

Analyze our strategic position for content marketing domination.`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

// Generate world-class content calendar for ICP Pilot
export async function generateICPPilotContentCalendar(analysis: WebsiteAnalysis, keywords: string[] = []): Promise<ContentCalendarItem[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 4000,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `You are the Chief Content Officer of ICP Pilot. Create a strategic 30-day content calendar that establishes ICP Pilot as THE authority in AI-powered sales methodology.

CONTENT PILLARS:
1. OBJECTION MASTERY: Advanced objection handling using proven frameworks
2. ICP SCIENCE: Strategic customer profiling methodology
3. MESSAGE ENGINEERING: Systematic outreach and messaging
4. QUALIFICATION FRAMEWORKS: Discovery questions and sales processes
5. SALES METHODOLOGY: Implementation of proven sales systems

Return JSON with "contentCalendar" array of 30 items, each with:
- title: compelling, expert-level title
- category: one of the 5 pillars above
- targetKeywords: 3-5 strategic keywords
- contentBrief: detailed brief with specific frameworks to cover
- targetAudience: specific persona (Sales Manager, BDR, AE, VP Sales)
- contentType: format optimized for topic
- priority: high/medium/low based on conversion potential
- scheduledDate: YYYY-MM-DD format starting from 2024-01-01`,
      },
      {
        role: 'user',
        content: `Generate Phase 1 (30 days) of our content calendar. Each piece should demonstrate ICP Pilot's deep sales methodology expertise.`,
      },
    ],
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result.contentCalendar || [];
}

// Generate world-class blog post for ICP Pilot
export async function generateICPPilotBlogPost(
  calendarItem: ContentCalendarItem,
  analysis: WebsiteAnalysis
): Promise<BlogPostContent> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `You are the Head of Sales Methodology at ICP Pilot with 20+ years closing $100M+ in B2B deals. You're writing expert-level content for B2B sales professionals.

IDENTITY: You're a PRACTICING sales professional who happens to write. Your content reflects real battlefield experience with specific methodologies and proven frameworks.

ICP PILOT CONTEXT:
- We revolutionize B2B sales through AI-powered methodology implementation
- Our solutions: ICP Builder, Objection Killer, Message Generator, Qualification Framework
- We solve: Manual content creation, inconsistent messaging, poor qualification
- Our edge: Methodology-first approach vs generic AI tools

WRITING MISSION: Create content that establishes ICP Pilot as THE authority in sales methodology.

CONTENT STANDARDS:
1. METHODOLOGY-FIRST: Ground content in proven frameworks (Sandler, Challenger, SPIN)
2. SPECIFIC & ACTIONABLE: Provide exact processes, not vague advice
3. AUTHENTIC VOICE: Write like a sales professional, not a marketer
4. STRATEGIC POSITIONING: Naturally position ICP Pilot as implementation leader

TARGET: 2000-2500 words of expert-level content.

Return JSON with:
- title: Expert-level title promising specific value
- slug: SEO-optimized URL slug
- excerpt: Compelling excerpt for sales professionals
- content: HTML content with proper formatting and frameworks
- metaTitle: SEO meta title with keywords
- metaDescription: Meta description that drives clicks
- targetKeywords: naturally integrated keywords
- category: content pillar category
- tags: relevant methodology tags
- readingTime: accurate reading time estimate`,
      },
      {
        role: 'user',
        content: `Content Calendar Item:
Title: ${calendarItem.title}
Category: ${calendarItem.category}
Target Keywords: ${calendarItem.targetKeywords.join(', ')}
Content Brief: ${calendarItem.contentBrief}
Target Audience: ${calendarItem.targetAudience}

Write as the Head of Sales Methodology at ICP Pilot. Demonstrate deep B2B sales expertise while positioning ICP Pilot as the methodology implementation leader.`,
      },
    ],
  });

  try {
    const content = completion.choices[0].message.content || '{}';
    console.log('Raw AI blog response:', content.substring(0, 200) + '...');
    return JSON.parse(content);
  } catch (error) {
    console.error('JSON parsing error in blog generation:', error);
    console.log('Failed content:', completion.choices[0].message.content);
    // Return a fallback structure
    return {
      title: "Generated Blog Post",
      slug: "generated-blog-post",
      excerpt: "AI-generated content",
      content: "<p>Content generation error occurred.</p>",
      metaTitle: "Generated Post",
      metaDescription: "AI-generated blog post",
      targetKeywords: [],
      category: "General",
      tags: [],
      readingTime: 5
    };
  }
}

// Legacy functions for compatibility
export async function generateKeywordStrategy(): Promise<string[]> {
  return ['sales objection handling', 'B2B sales methodology', 'sales qualification framework', 'ICP development', 'sales enablement tools'];
}

export async function generateContentCalendar(analysis: WebsiteAnalysis): Promise<ContentCalendarItem[]> {
  const keywords = await generateKeywordStrategy();
  return generateICPPilotContentCalendar(analysis, keywords);
}

export async function generateBlogPost(calendarItem: ContentCalendarItem, analysis: WebsiteAnalysis): Promise<BlogPostContent> {
  return generateICPPilotBlogPost(calendarItem, analysis);
}