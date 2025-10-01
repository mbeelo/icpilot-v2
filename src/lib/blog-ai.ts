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

interface KeywordCluster {
  theme: string;
  primaryKeyword: string;
  semanticKeywords: string[];
  searchIntent: 'informational' | 'commercial' | 'transactional';
  difficulty: 'low' | 'medium' | 'high';
  priority: number;
}

interface ContentStrategy {
  keywords: string[];
  clusters: KeywordCluster[];
  contentPillars: string[];
  competitiveGaps: string[];
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

// Research target keywords for ICP Pilot's market
export async function generateKeywordStrategy(): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `You are a world-class B2B SaaS SEO strategist with 15+ years experience in sales enablement marketing. You understand exactly what sales professionals search for when they have problems ICP Pilot solves.

Your task: Generate 50 high-intent, high-volume keywords that our target audience actively searches for. Focus on:

1. Problem-aware keywords ("how to handle sales objections", "sales qualification framework")
2. Solution-aware keywords ("sales enablement tools", "ICP builder software")
3. Long-tail buyer intent ("best objection handling techniques for B2B", "sales discovery questions template")
4. Industry-specific terms ("SaaS sales methodology", "enterprise sales process")

Return as JSON array of 50 keyword strings, prioritized by search intent and relevance to ICP Pilot's solutions.`,
      },
      {
        role: 'user',
        content: `ICP Pilot Context:
- B2B sales enablement platform solving objection handling, message personalization, ICP creation, and sales qualification
- Target: Sales teams, BDRs, AEs, Sales Managers at B2B companies
- Unique value: AI-powered sales methodology implementation with proven frameworks
- Pain points solved: Time-consuming manual sales content creation, inconsistent messaging, poor qualification processes

Generate strategic keywords our prospects search for when experiencing these problems.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result.keywords || [];
}

// Deep analysis of ICP Pilot's market position and content strategy
export async function analyzeICPPilotMarket(): Promise<WebsiteAnalysis> {
  const icpPilotContext = `
    COMPANY: ICP Pilot v2 - The Sales Methodology Revolution

    MISSION: Transform B2B sales teams from reactive order-takers to strategic revenue generators through AI-powered methodology implementation.

    CORE PROBLEM WE SOLVE:
    Sales teams waste 40+ hours per week on manual content creation, have inconsistent messaging, and lack systematic approaches to objection handling and qualification. This leads to:
    - 23% lower close rates
    - 3x longer sales cycles
    - 67% higher customer acquisition costs
    - Massive rep turnover due to frustration

    OUR REVOLUTIONARY SOLUTION:
    - ICP Builder: Strategic customer profiling based on firmographic, behavioral, and psychographic data
    - Objection Killer: AI implementation of proven frameworks (Sandler, Challenger Sale, SPIN Selling) for bulletproof rebuttals
    - Message Generator: Hyper-personalized outreach using prospect research and proven messaging frameworks
    - Qualification Framework: Systematic discovery question development with weighted scoring systems
    - Output Library: Centralized knowledge base of battle-tested sales assets

    UNIQUE MARKET POSITION:
    We're the ONLY platform that combines:
    1. Proven sales methodologies (not generic AI)
    2. Deep B2B sales expertise (built by sales professionals FOR sales professionals)
    3. Systematic approach to sales enablement (not just random content generation)
    4. Measurable ROI (15+ min saved per objection, 20+ min per message, 45+ min per framework)

    TARGET MARKET:
    - Primary: B2B sales teams at $1M-$100M ARR companies
    - Personas: Sales Managers, VPs of Sales, Sales Operations, Individual Reps
    - Pain points: Quota pressure, inconsistent performance, manual content creation, lack of systematic processes

    COMPETITIVE ADVANTAGES:
    1. Methodology-first approach (vs generic AI tools)
    2. Built by sales experts who've closed $100M+ in deals
    3. Systematic frameworks vs random content generation
    4. Measurable time savings and ROI
    5. Integration with existing sales tech stacks

    CONTENT STRATEGY IMPERATIVES:
    - Establish thought leadership in sales methodology space
    - Target problem-aware prospects searching for solutions
    - Demonstrate deep understanding of B2B sales challenges
    - Position as THE authority on AI-powered sales enablement
    - Drive qualified traffic that converts to trials and demos
  `;

  const completion = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    temperature: 0.2,
    system: `You are the CMO of ICP Pilot with 20+ years experience building category-defining B2B SaaS companies. You've taken 3 companies from $0 to $100M+ ARR through strategic content marketing and thought leadership.

Your expertise: B2B sales methodology, sales enablement, content marketing, and positioning strategy.

Analyze ICP Pilot's market position and extract strategic insights for our content domination strategy. This analysis will drive our 90-day content calendar that establishes us as THE authority in AI-powered sales methodology.

Return strategic analysis as JSON with:
- productName: string
- primaryValue: string (unique value proposition that differentiates from generic AI tools)
- targetAudience: string (specific personas with pain points)
- keyFeatures: string[] (features that solve real B2B sales problems)
- painPointsSolved: string[] (specific, measurable problems we solve)
- industryContext: string (our unique position in sales enablement landscape)
- competitiveAdvantages: string[] (what makes us category-defining)
- contentThemes: string[] (5 core themes for thought leadership)
- conversionKeywords: string[] (10 high-intent keywords for each theme)`,
    messages: [
      {
        role: 'user',
        content: icpPilotContext,
      },
    ],
  });

  return JSON.parse(completion.content[0].type === 'text' ? completion.content[0].text : '{}');
}

// Generate strategic 90-day content calendar for ICP Pilot market domination
export async function generateICPPilotContentCalendar(analysis: WebsiteAnalysis, keywords: string[]): Promise<ContentCalendarItem[]> {
  const completion = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.4,
    system: `You are the Chief Content Officer of ICP Pilot with 20+ years building category-defining B2B SaaS content strategies. You've driven $500M+ in pipeline through strategic SEO content at companies like HubSpot, Salesforce, and Gong.

Your expertise: B2B sales methodology, sales enablement, SEO strategy, and thought leadership positioning.

MISSION: Create a 90-day content calendar that establishes ICP Pilot as THE definitive authority in AI-powered sales methodology and drives qualified B2B sales professionals to our platform.

STRATEGIC IMPERATIVES:
1. Position ICP Pilot as the category-defining leader in sales methodology automation
2. Target exact keywords our prospects search when experiencing pain points we solve
3. Create content that demonstrates deep sales expertise (not generic AI advice)
4. Build systematic thought leadership that converts prospects to trials
5. Focus on problem-first content that naturally leads to ICP Pilot solutions

CONTENT PILLARS (distribute evenly):
1. OBJECTION MASTERY: Advanced objection handling using proven frameworks (Sandler, Challenger, SPIN)
2. ICP SCIENCE: Strategic customer profiling and qualification methodology
3. MESSAGE ENGINEERING: Systematic approach to personalized outreach and messaging
4. QUALIFICATION FRAMEWORKS: Discovery question development and systematic sales processes
5. SALES METHODOLOGY: Implementation of proven sales systems and frameworks

CONTENT STRATEGY:
- 70% educational/problem-focused content
- 20% methodology/framework content
- 10% solution-aware content with natural ICP Pilot positioning

TARGET KEYWORDS: Use provided keywords strategically across calendar

Return JSON with "contentCalendar" array of 30 items (we'll generate 90-day calendar in 3 phases), each with:
- title: compelling, expert-level title that promises specific value
- category: one of the 5 content pillars above
- targetKeywords: 3-5 strategic keywords from provided list
- contentBrief: detailed brief including specific frameworks/methodologies to cover, key insights, and natural ICP Pilot positioning angle
- targetAudience: specific persona (Sales Manager, BDR, AE, VP Sales, etc.)
- contentType: format optimized for topic and keywords
- priority: high/medium/low based on keyword difficulty and conversion potential
- scheduledDate: YYYY-MM-DD format starting from tomorrow`,
    messages: [
      {
        role: 'user',
        content: `ICP Pilot Strategic Context: ${JSON.stringify(analysis, null, 2)}

Target Keywords: ${keywords.join(', ')}

Generate Phase 1 (30 days) of our 90-day market domination content calendar. Each piece should demonstrate ICP Pilot's deep sales methodology expertise and naturally position our solutions.`,
      },
    ],
  });

  const result = JSON.parse(completion.content[0].type === 'text' ? completion.content[0].text : '{}');
  return result.contentCalendar || [];
}

// Legacy function for backward compatibility
export async function generateContentCalendar(analysis: WebsiteAnalysis): Promise<ContentCalendarItem[]> {
  const keywords = await generateKeywordStrategy();
  return generateICPPilotContentCalendar(analysis, keywords);
}

// Generate world-class blog post with ICP Pilot expertise and quality gates
export async function generateICPPilotBlogPost(
  calendarItem: ContentCalendarItem,
  analysis: WebsiteAnalysis
): Promise<BlogPostContent> {
  const completion = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.7, // Balanced for expert-level content with authenticity
    system: `You are the Head of Sales Methodology at ICP Pilot with 20+ years closing $100M+ in B2B deals. You've implemented sales systems at companies like Salesforce, HubSpot, and Gong. You're writing for your peers in the B2B sales community.

IDENTITY: You're not just a content writer - you're a PRACTICING sales professional who happens to write. Your content reflects real battlefield experience, specific methodologies, and proven frameworks.

ICP PILOT CONTEXT:
- We revolutionize B2B sales through AI-powered methodology implementation
- Our solutions: ICP Builder, Objection Killer, Message Generator, Qualification Framework
- We solve: Manual content creation, inconsistent messaging, poor qualification processes
- We save: 15+ min per objection, 20+ min per message, 45+ min per framework
- Our edge: Methodology-first approach vs generic AI tools

WRITING MISSION: Create content that establishes ICP Pilot as THE authority in sales methodology while providing genuine value to B2B sales professionals.

CONTENT STANDARDS:
1. METHODOLOGY-FIRST: Always ground content in proven sales frameworks (Sandler, Challenger, SPIN, etc.)
2. SPECIFIC & ACTIONABLE: Provide exact processes, not vague advice
3. AUTHENTIC VOICE: Write like a sales professional, not a marketer
4. STRATEGIC POSITIONING: Naturally position ICP Pilot as the methodology implementation leader
5. CONVERSION-FOCUSED: Drive qualified prospects to discover our solutions

WRITING APPROACH:
- Start with a specific sales scenario or challenge
- Reference exact methodologies and frameworks by name
- Include "war stories" from deal experience (make them realistic)
- Use sales-specific language and terminology
- Provide step-by-step processes and frameworks
- Natural ICP Pilot mentions when discussing implementation challenges
- End with a clear call-to-action that drives engagement

AVOID:
- Generic sales advice found everywhere
- AI-sounding language or perfect structure
- Obvious product pitches or forced mentions
- Content that could apply to any industry
- Theoretical advice without practical application

TARGET: 2000-2500 words of expert-level content that could only be written by someone with deep B2B sales experience.

Return JSON with:
- title: Expert-level title that promises specific methodology value
- slug: SEO-optimized URL slug
- excerpt: Compelling excerpt that hooks sales professionals
- content: HTML content with proper formatting, subheads, and methodology frameworks
- metaTitle: SEO meta title with target keywords
- metaDescription: Meta description that drives clicks from SERPs
- targetKeywords: naturally integrated target keywords
- category: content pillar category
- tags: relevant methodology and topic tags
- readingTime: accurate reading time estimate`,
    messages: [
      {
        role: 'user',
        content: `Content Calendar Item:
Title: ${calendarItem.title}
Category: ${calendarItem.category}
Target Keywords: ${calendarItem.targetKeywords.join(', ')}
Content Brief: ${calendarItem.contentBrief}
Target Audience: ${calendarItem.targetAudience}
Content Type: ${calendarItem.contentType}

ICP Pilot Strategic Context: ${JSON.stringify(analysis, null, 2)}

Write as the Head of Sales Methodology at ICP Pilot. Demonstrate deep expertise in B2B sales while naturally positioning ICP Pilot as the leader in methodology implementation. Make it feel like it was written by someone who's closed millions in deals and implemented these exact frameworks.`,
      },
    ],
  });

  return JSON.parse(completion.content[0].type === 'text' ? completion.content[0].text : '{}');
}

// Legacy function for backward compatibility
export async function generateBlogPost(
  calendarItem: ContentCalendarItem,
  analysis: WebsiteAnalysis
): Promise<BlogPostContent> {
  return generateICPPilotBlogPost(calendarItem, analysis);
}

// Generate single high-quality blog post with quality gates
export async function generateQualityBlogPost(
  calendarItem: ContentCalendarItem,
  analysis: WebsiteAnalysis
): Promise<BlogPostContent & { qualityScore: number; improvements: string[] }> {

  // Step 1: Generate initial content
  const initialContent = await generateICPPilotBlogPost(calendarItem, analysis);

  // Step 2: Quality assessment
  const qualityAssessment = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    temperature: 0.2,
    system: `You are a world-class content quality assessor for B2B sales methodology content. Score content on a 1-10 scale across these criteria:

1. Sales Methodology Depth (specific frameworks referenced)
2. ICP Pilot Brand Authority (natural positioning as leader)
3. Actionability (specific, implementable advice)
4. Human Authenticity (avoids AI detection)
5. SEO Optimization (keyword integration, structure)
6. Conversion Potential (drives qualified prospects)

Return JSON with:
- overallScore: average score 1-10
- criteriaScores: object with each criteria score
- improvements: array of specific improvement suggestions
- passesQualityGate: boolean (true if score >= 8.0)`,
    messages: [
      {
        role: 'user',
        content: `Assess this blog post content:

Title: ${initialContent.title}
Content: ${initialContent.content}
Target Keywords: ${calendarItem.targetKeywords.join(', ')}
Target Audience: ${calendarItem.targetAudience}

Provide detailed quality assessment and improvement recommendations.`,
      },
    ],
  });

  const assessment = JSON.parse(qualityAssessment.content[0].type === 'text' ? qualityAssessment.content[0].text : '{}');

  return {
    ...initialContent,
    qualityScore: assessment.overallScore || 0,
    improvements: assessment.improvements || []
  };
}

// Legacy batch function (deprecated - use one-at-a-time for quality)
export async function generateBatchBlogPosts(
  calendarItems: ContentCalendarItem[],
  analysis: WebsiteAnalysis,
  batchSize: number = 1 // Reduced to 1 for quality focus
): Promise<BlogPostContent[]> {
  const results: BlogPostContent[] = [];

  for (const item of calendarItems.slice(0, batchSize)) {
    const qualityPost = await generateQualityBlogPost(item, analysis);

    // Only include posts that pass quality gates
    if (qualityPost.qualityScore >= 8.0) {
      results.push(qualityPost);
    }

    // Always include delay for API rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

// Optimize existing content for better SEO
export async function optimizeContentForSEO(
  content: string,
  targetKeywords: string[]
): Promise<string> {
  const completion = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.4,
    system: `You are an SEO optimization expert. Improve the provided content to better rank for the target keywords while maintaining readability and value.

Optimization focus:
- Natural keyword integration
- Improve heading structure
- Enhance readability
- Add semantic keywords
- Improve internal linking opportunities
- Maintain original tone and value`,
    messages: [
      {
        role: 'user',
        content: `Content to optimize: ${content}

Target keywords: ${targetKeywords.join(', ')}

Return the optimized HTML content.`,
      },
    ],
  });

  return completion.content[0].type === 'text' ? completion.content[0].text : content;
}