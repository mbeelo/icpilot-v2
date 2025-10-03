import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 3, // Retry failed requests 3 times
});

// Resilient OpenAI wrapper with fallback handling
async function callOpenAI(params: OpenAI.Chat.ChatCompletionCreateParams, fallbackResponse: Record<string, unknown>) {
  try {
    const response = await openai.chat.completions.create({
      ...params,
      stream: false // Ensure we get a non-streaming response
    }) as OpenAI.Chat.ChatCompletion;
    const content = response.choices[0].message.content;

    if (!content) {
      console.warn('Empty response from OpenAI, using fallback');
      return fallbackResponse;
    }

    return content;
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);

    // Handle specific error types
    const errorWithStatus = error as { status?: number };
    if (errorWithStatus.status === 429) {
      console.error('Rate limit exceeded');
    } else if (errorWithStatus.status === 401) {
      console.error('Invalid API key');
    } else if (errorWithStatus.status === 500) {
      console.error('OpenAI server error');
    }

    // Always return fallback instead of throwing
    console.warn('Using fallback response due to OpenAI error');
    return JSON.stringify(fallbackResponse);
  }
}

// Safe JSON parser with comprehensive error handling
function safeJsonParse(content: string, fallback: Record<string, unknown>): Record<string, unknown> {
  try {
    // Clean problematic characters but preserve whitespace
    const cleaned = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars but keep \n (0x0A) and \r (0x0D) and \t (0x09)
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw content:', content);
    console.warn('Using fallback data');
    return fallback;
  }
}

interface ICPData {
  name: string;
  industry: string;
  companySize: string;
  role: string;
  painPoints: string[];
  outcomes: string[];
  triggers: string[];
  companyName?: string;
  productService?: string;
  valueProposition?: string;
  keyDifferentiators?: string[];
}

export async function generateObjectionRebuttal(icp: ICPData, objection: string, prospectInfo?: {
  name?: string;
  company?: string;
  title?: string;
  specificContext?: string;
}, methodology?: string, salesContext?: {
  salesCycle?: string;
  stakeholderLevel?: string;
  relationshipTemp?: string;
  competitiveSituation?: string;
}) {

  // World-class sales expert system prompt - this is the breakthrough
  const expertSystemPrompt = `You are a world-class sales expert with 20+ years closing enterprise deals. You work with elite B2B sales teams and have generated over $500M in revenue.

EXPERTISE AREAS:
- Enterprise B2B sales psychology and decision-making patterns
- Advanced objection handling across all sales methodologies
- Industry-specific competitive intelligence and market dynamics
- Executive communication and influence strategies
- ROI modeling and business case development

RESPONSE PHILOSOPHY:
- Demonstrate mastery, not templates
- Show deep industry knowledge and market understanding
- Build confidence through expertise, not defensiveness
- Use specific, credible metrics and examples
- Maintain conversational flow without rigid sections
- Position yourself as a trusted advisor, not a vendor

FORBIDDEN APPROACHES:
- Generic templates or scripts
- Obvious section breaks or formulaic structure
- Basic objection handling phrases ("I understand your concern...")
- Weak or defensive language
- One-size-fits-all responses`;

  // Get framework-specific guidance
  const getFrameworkGuidance = (objectionType: string) => {
    const frameworkGuides = {
      'Price & Budget Concerns': `
FRAMEWORK: VALUE-BASED OBJECTION HANDLING
- Lead with quantified business impact and ROI
- Reframe cost as investment in competitive advantage
- Use specific metrics and industry benchmarks
- Challenge status quo costs (current inefficiencies)
- Position as strategic imperative, not expense`,

      'Timing & Urgency Issues': `
FRAMEWORK: CONSULTATIVE URGENCY CREATION
- Uncover business implications of delay
- Use market timing and competitive intelligence
- Reference industry trends and windows of opportunity
- Create urgency through insight, not pressure
- Position timing as competitive advantage`,

      'Authority & Decision Making': `
FRAMEWORK: STRATEGIC STAKEHOLDER MAPPING
- Identify true economic buyer and influence map
- Provide tools/materials for internal selling
- Coach on business case presentation
- Offer executive-level engagement and validation
- Structure pilot or proof-of-concept approach`,

      'Status Quo & Satisfaction': `
FRAMEWORK: CHALLENGER SALE METHODOLOGY
- Challenge assumptions with industry insights
- Present market evolution and disruption risks
- Use peer comparison and competitive intelligence
- Create dissatisfaction through education
- Position change as risk mitigation`,

      'Competitive & Alternative Solutions': `
FRAMEWORK: DIFFERENTIATION & COMPETITIVE POSITIONING
- Focus on unique capabilities and proven results
- Use specific customer success examples
- Highlight implementation and support advantages
- Address total cost of ownership
- Leverage partnerships and ecosystem advantages`,

      'Trust & Credibility Concerns': `
FRAMEWORK: EVIDENCE-BASED CREDIBILITY BUILDING
- Provide specific references and case studies
- Offer proof-of-concept or trial period
- Share third-party validation and awards
- Demonstrate deep industry knowledge
- Connect with similar customer examples`
    };
    return frameworkGuides[objectionType] || frameworkGuides['Price & Budget Concerns'];
  };

  // Step 1: Analyze objection context and determine response strategy
  const analysisPrompt = `${expertSystemPrompt}

OBJECTION ANALYSIS TASK:
Analyze this sales objection to determine the optimal response strategy.

CONTEXT:
- Objection: "${objection}"
- Target: ${icp.role} in ${icp.industry}
- Company Size: ${icp.companySize}
- Key Pain Points: ${icp.painPoints.slice(0, 3).join(', ')}
- Your Solution: ${icp.companyName || 'AI-powered sales platform'} - ${icp.valueProposition || 'sales automation and personalization'}
${prospectInfo?.name ? `- Prospect: ${prospectInfo.name} (${prospectInfo.title}) at ${prospectInfo.company}` : ''}
${prospectInfo?.specificContext ? `- Prospect Context: ${prospectInfo.specificContext}` : ''}
${salesContext?.salesCycle ? `- Sales Cycle Stage: ${salesContext.salesCycle}` : ''}
${salesContext?.stakeholderLevel ? `- Stakeholder Level: ${salesContext.stakeholderLevel}` : ''}
${salesContext?.relationshipTemp ? `- Relationship: ${salesContext.relationshipTemp}` : ''}
${salesContext?.competitiveSituation ? `- Competitive Situation: ${salesContext.competitiveSituation}` : ''}

${methodology ? getFrameworkGuidance(methodology) : ''}

OUTPUT STRATEGY:
{
  "objectionType": "price/timing/competition/authority/need/trust",
  "primaryAngle": "specific strategic approach for this objection",
  "keyInsight": "industry insight or reframe to lead with",
  "competitiveEdge": "how to differentiate from alternatives",
  "credibilityMarker": "specific metric, example, or proof point to include"
}`;

  const fallbackStrategy = {
    objectionType: "general",
    primaryAngle: "reframe through industry expertise and proven results",
    keyInsight: "industry leaders are already solving this challenge",
    competitiveEdge: "demonstrated ROI and rapid implementation",
    credibilityMarker: "measurable results within 90 days"
  };

  const analysisContent = await callOpenAI({
    model: "gpt-4",
    messages: [{ role: "user", content: analysisPrompt }],
    temperature: 0.1,
    max_tokens: 300,
  }, fallbackStrategy);

  const strategy = safeJsonParse(typeof analysisContent === 'string' ? analysisContent : JSON.stringify(analysisContent), fallbackStrategy);

  // Step 2: Generate 3 sophisticated response variants
  const variantsPrompt = `${expertSystemPrompt}

RESPONSE GENERATION TASK:
Create 3 sophisticated objection responses that demonstrate world-class sales expertise.

STRATEGIC CONTEXT:
- Objection: "${objection}"
- Type: ${strategy.objectionType}
- Primary Angle: ${strategy.primaryAngle}
- Key Insight: ${strategy.keyInsight}
- Competitive Edge: ${strategy.competitiveEdge}
- Credibility Marker: ${strategy.credibilityMarker}

TARGET CONTEXT:
- Prospect: ${prospectInfo?.name ? `${prospectInfo.name} (${prospectInfo.title}) at ${prospectInfo.company}` : `${icp.role} at ${icp.industry} company`}
${prospectInfo?.specificContext ? `- Prospect Context: ${prospectInfo.specificContext}` : ''}
- Company Size: ${icp.companySize}
- Pain Points: ${icp.painPoints.slice(0, 2).join(', ')}
- Your Solution: ${icp.companyName || 'Sales automation platform'} - ${icp.valueProposition || 'AI-powered sales enablement'}
${salesContext?.salesCycle ? `- Sales Cycle Stage: ${salesContext.salesCycle}` : ''}
${salesContext?.stakeholderLevel ? `- Stakeholder Level: ${salesContext.stakeholderLevel}` : ''}
${salesContext?.relationshipTemp ? `- Relationship: ${salesContext.relationshipTemp}` : ''}
${salesContext?.competitiveSituation ? `- Competitive Situation: ${salesContext.competitiveSituation}` : ''}

CREATE 3 EXPERT VARIANTS:

VARIANT 1 - "EXECUTIVE CHALLENGER"
- Direct, insight-driven approach for senior decision makers
- Challenge their thinking with industry intelligence
- Position as peer-level advisor with proven track record
- Best for: C-level and VP stakeholders who respond to confidence

VARIANT 2 - "CONSULTATIVE PARTNER"
- Question-based, discovery-focused methodology
- Uncover deeper business implications and consequences
- Build collaborative problem-solving dynamic
- Best for: Directors and managers who value partnership

VARIANT 3 - "EVIDENCE-DRIVEN CLOSER"
- ROI-focused, data-heavy approach with specific proof points
- Quantify impact and demonstrate clear value proposition
- Urgency creation through competitive intelligence
- Best for: Analytical buyers and procurement-influenced decisions

REQUIREMENTS FOR EACH VARIANT:
- Natural, conversational flow (NO section breaks)
- Include prospect's name and company naturally (use placeholders like [First Name] if not provided)
- Reference objection naturally and smoothly - NEVER copy-paste objection text verbatim, integrate the concept naturally
- Specific industry knowledge and market insights
- Credible metrics and proof points
- Confident, expert positioning
- 150-250 words each
- Build toward natural next step
- STRUCTURE NATURALLY based on your approach - don't force identical formatting across variants
- Executive Challenger: Should feel direct and insight-driven
- Consultative Partner: Should feel question-based and collaborative
- Evidence-Driven Closer: Should feel data-heavy and ROI-focused

OUTPUT FORMAT:
[
  {
    "variant": "Executive Challenger",
    "approach": "Direct, insight-driven challenge",
    "bestFor": "C-level executives and senior decision makers",
    "response": "full response text..."
  },
  {
    "variant": "Consultative Partner",
    "approach": "Question-based, discovery-focused",
    "bestFor": "Directors and managers who value collaboration",
    "response": "full response text..."
  },
  {
    "variant": "Evidence-Driven Closer",
    "approach": "ROI-focused with specific proof points",
    "bestFor": "Analytical buyers and procurement influence",
    "response": "full response text..."
  }
]`;

  // Sophisticated fallback responses
  const getFallbackResponses = () => {
    const name = prospectInfo?.name || 'there';
    const company = prospectInfo?.company || 'your organization';
    const title = prospectInfo?.title || icp.role;

    return [
      {
        variant: "Executive Challenger",
        approach: "Direct, insight-driven challenge",
        bestFor: "C-level executives and senior decision makers",
        response: `${name}, I appreciate you bringing up "${objection}". Having worked with over 200 ${icp.role}s in ${icp.industry}, I can tell you that the companies still debating this in 2024 are the ones losing market share. The leaders in your space - the ones hitting 40% growth while others struggle - made this decision 6-12 months ago. They're now capturing competitive advantage while their competitors are having this exact conversation. Based on ${company}'s growth trajectory and what you've shared about ${icp.painPoints[0]}, you're positioned to be either the leader who captures this advantage or the company that follows. The data shows that ${icp.role}s who act on this typically see 30-50% improvement in their key metrics within 90 days. Given your role and objectives, waiting another quarter could cost you significant competitive positioning. What would it mean for ${company} if you were 6 months ahead of your competition instead of 6 months behind?`
      },
      {
        variant: "Consultative Partner",
        approach: "Question-based, discovery-focused",
        bestFor: "Directors and managers who value collaboration",
        response: `${name}, that's a thoughtful concern about "${objection}" and I'd like to explore this with you. In my experience working with ${title}s at similar ${icp.industry} companies, this question usually surfaces when there's a deeper consideration at play. Can I ask - what would need to be true for this to feel like the right decision for ${company}? When I think about your situation with ${icp.painPoints[0]}, and the growth goals you've mentioned, help me understand what the cost of inaction looks like over the next 6-12 months. If you continue with your current approach, where do you see ${company} relative to your competitors who are already solving this challenge? I'm curious about your perspective on this because the most successful ${title}s I work with often tell me that the biggest risk wasn't investing in the solution - it was the opportunity cost of waiting. What's your experience been with similar decisions in the past? And if we could demonstrate clear ROI within 60 days, how would that change your thinking about the timeline for this decision?`
      },
      {
        variant: "Evidence-Driven Closer",
        approach: "ROI-focused with specific proof points",
        bestFor: "Analytical buyers and procurement influence",
        response: `${name}, let me share some specific data that directly addresses "${objection}". I just completed a study with 47 ${icp.industry} companies, all similar to ${company} in size and growth stage. The companies that moved forward with this solution achieved average ROI of 340% within the first year, with payback typically occurring in 90-120 days. More specifically for ${title}s dealing with ${icp.painPoints[0]}, we documented average improvements of 32% in efficiency and 28% reduction in time-to-result. The total economic impact for a company your size typically ranges from $200K-$500K annually. But here's what's really compelling: companies that implemented this in Q1 vs Q4 of last year showed 60% better results, primarily due to competitive timing. Your closest competitors in ${icp.industry} - without naming names - are already implementing solutions in this category. The window for first-mover advantage in your market is closing rapidly. We can have you operational and seeing measurable results within 30 days. Given the documented ROI and the competitive timing, what specific information would you need to move forward this quarter?`
      }
    ];
  };

  const fallbackResponses = getFallbackResponses();

  const responsesContent = await callOpenAI({
    model: "gpt-4",
    messages: [{ role: "user", content: variantsPrompt }],
    temperature: 0.4,
    max_tokens: 1500,
  }, fallbackResponses as unknown as Record<string, unknown>);

  return safeJsonParse(typeof responsesContent === 'string' ? responsesContent : JSON.stringify(responsesContent), fallbackResponses as unknown as Record<string, unknown>) as unknown;
}

export async function generateMessages(icp: ICPData, messageType: string, trigger: string, prospectInfo: {
  name: string;
  company: string;
  title: string;
  specificContext?: string;
}, outreachContext?: {
  urgency?: string;
  relationshipLevel?: string;
  competitiveIntel?: string;
  industryEvent?: string;
}) {

  // World-class sales expert system prompt - same expertise as objection killer
  const expertSystemPrompt = `You are a world-class B2B sales expert with 20+ years of enterprise sales experience and over $500M in closed revenue. You specialize in high-converting outreach that gets responses from senior executives.

EXPERTISE AREAS:
- Executive communication psychology and decision triggers
- Industry-specific market intelligence and competitive dynamics
- Timing-based opportunity recognition and urgency creation
- Personalization at scale without sounding templated
- Multi-touch sequence design and follow-up strategies

MESSAGING PHILOSOPHY:
- Lead with insight, not pitch
- Demonstrate industry authority through specific knowledge
- Use credible metrics and timely market intelligence
- Create genuine curiosity through valuable perspectives
- Position as peer-level advisor, not vendor

FORBIDDEN APPROACHES:
- Generic templates or obvious sales language
- Weak CTAs like "quick chat" or "are you available"
- Vague social proof or made-up statistics
- One-size-fits-all messaging
- Salesy language that screams "vendor"`;

  // Step 1: Analyze trigger and market context for strategic approach
  const contextAnalysisPrompt = `${expertSystemPrompt}

TRIGGER ANALYSIS TASK:
Analyze this outreach trigger to determine the optimal messaging strategy based on market timing and prospect psychology.

CONTEXT:
- Trigger: "${trigger}"
- Prospect: ${prospectInfo.name} (${prospectInfo.title}) at ${prospectInfo.company}
${prospectInfo.specificContext ? `- Prospect Context: ${prospectInfo.specificContext}` : ''}
- Target Market: ${icp.role} in ${icp.industry}
- Company Size: ${icp.companySize}
- Key Pain Points: ${icp.painPoints.slice(0, 3).join(', ')}
- Your Solution: ${icp.companyName || 'AI-powered sales platform'} - ${icp.valueProposition || 'sales automation and personalization'}
${outreachContext?.urgency ? `- Urgency Factor: ${outreachContext.urgency}` : ''}
${outreachContext?.relationshipLevel ? `- Relationship Level: ${outreachContext.relationshipLevel}` : ''}
${outreachContext?.competitiveIntel ? `- Competitive Intel: ${outreachContext.competitiveIntel}` : ''}
${outreachContext?.industryEvent ? `- Industry Context: ${outreachContext.industryEvent}` : ''}

OUTPUT STRATEGY:
{
  "primaryAngle": "specific strategic approach for this trigger",
  "keyInsight": "valuable market insight or trend to lead with",
  "urgencyDriver": "timing-based reason to act now",
  "credibilityMarker": "specific proof point or industry reference",
  "personalizationHook": "unique element specific to this prospect/company"
}`;

  const fallbackStrategy = {
    primaryAngle: "industry expertise with timely market insight",
    keyInsight: "market leaders are already implementing AI-native solutions",
    urgencyDriver: "competitive advantage window is closing rapidly",
    credibilityMarker: "documented results from similar companies",
    personalizationHook: "company's growth stage and scaling challenges"
  };

  const strategyContent = await callOpenAI({
    model: "gpt-4",
    messages: [{ role: "user", content: contextAnalysisPrompt }],
    temperature: 0.1,
    max_tokens: 300,
  }, fallbackStrategy);

  const strategy = safeJsonParse(typeof strategyContent === 'string' ? strategyContent : JSON.stringify(strategyContent), fallbackStrategy);

  // Get message type framework guidance
  const getMessageTypeGuidance = (messageType: string) => {
    const frameworkGuides = {
      'Cold LinkedIn Message': `
FRAMEWORK: SOCIAL SELLING METHODOLOGY
- Lead with industry insight or shared connection
- Reference specific company achievements or news
- Keep professional but conversational tone
- Focus on building relationship before selling
- Use curiosity-driven questions and value-first approach`,

      'Cold Email': `
FRAMEWORK: DIRECT OUTREACH EXCELLENCE
- Compelling subject line with specific value proposition
- Personalized opening with research-driven insights
- Clear and concise message structure
- Strong call-to-action with specific next step
- Professional tone with executive-level language`,

      'Follow-up Email': `
FRAMEWORK: NURTURE SEQUENCE STRATEGY
- Reference previous conversation or touchpoint
- Advance the conversation with new insights
- Address potential concerns or objections proactively
- Create urgency through market timing or opportunity
- Move toward specific commitment or next step`,

      'LinkedIn Connection Request': `
FRAMEWORK: NETWORK BUILDING APPROACH
- Personalized connection reason with mutual value
- Brief mention of shared interests or connections
- Professional but approachable tone
- Set expectation for follow-up conversation
- Focus on relationship building over immediate selling`,

      'InMail Message': `
FRAMEWORK: PREMIUM EXECUTIVE OUTREACH
- Executive-level communication style and positioning
- High-value market insights and strategic perspective
- Demonstrate industry expertise and thought leadership
- Respectful of executive time with clear, concise messaging
- Position as peer-level advisor with proven track record`,

      'Video Prospecting Message': `
FRAMEWORK: MULTI-MEDIA ENGAGEMENT STRATEGY
- Combine video personality with written professionalism
- Reference specific company details visible in video
- Create personal connection through authentic delivery
- Use video to build trust and demonstrate expertise
- Written follow-up reinforces video key points`
    };
    return frameworkGuides[messageType] || frameworkGuides['Cold Email'];
  };

  // Step 2: Generate 3 world-class message variants
  const messagesPrompt = `${expertSystemPrompt}

MESSAGE GENERATION TASK:
Create 3 sophisticated outreach messages that demonstrate true sales expertise and get responses from senior executives.

STRATEGIC CONTEXT:
- Message Type: ${messageType}
- Primary Angle: ${strategy.primaryAngle}
- Key Insight: ${strategy.keyInsight}
- Urgency Driver: ${strategy.urgencyDriver}
- Credibility Marker: ${strategy.credibilityMarker}
- Personalization Hook: ${strategy.personalizationHook}

TARGET CONTEXT:
- Prospect: ${prospectInfo.name} (${prospectInfo.title}) at ${prospectInfo.company}
- Trigger: ${trigger}
- Industry: ${icp.industry}
- Company Size: ${icp.companySize}
- Pain Points: ${icp.painPoints.slice(0, 2).join(', ')}
- Your Solution: ${icp.companyName || 'Sales automation platform'} - ${icp.valueProposition || 'AI-powered sales enablement'}

${getMessageTypeGuidance(messageType)}

CREATE 3 EXPERT VARIANTS:

VARIANT 1 - "MARKET INTELLIGENCE LEADER"
- Lead with exclusive market insight or trend analysis
- Position as industry thought leader with unique perspective
- Use specific competitive intelligence and timing factors
- Best for: Senior executives who value strategic insights

VARIANT 2 - "PEER ADVISOR APPROACH"
- Share relevant experience from similar successful implementations
- Use credible case studies and specific performance metrics
- Build collaborative peer-to-peer dynamic
- Best for: VPs and Directors who value proven results

VARIANT 3 - "URGENCY CATALYST"
- Create genuine urgency through market timing and competitive factors
- Use specific deadlines, market windows, or competitive pressure
- Include clear financial or competitive consequences of inaction
- Best for: Decision makers under growth pressure

REQUIREMENTS FOR EACH VARIANT:
- Natural, conversational tone (no obvious sales language)
- Include prospect's name and company naturally (use placeholders like [First Name] if not provided)
- Reference trigger naturally and smoothly - NEVER copy-paste trigger text verbatim, integrate the concept naturally
- Demonstrate deep industry knowledge
- Use specific, credible metrics (no vague claims)
- Strong, value-driven CTA (not "quick chat")
- Appropriate length for ${messageType}
- Build toward meaningful business conversation
- STRUCTURE NATURALLY based on your approach - don't force identical formatting across variants
- Market Intelligence: Should feel data-driven and analytical
- Peer Advisor: Should feel conversational and relationship-focused
- Urgency Catalyst: Should feel direct and action-oriented

OUTPUT FORMAT:
[
  {
    "variant": "Market Intelligence Leader",
    "approach": "Lead with exclusive market insight",
    "bestFor": "Senior executives who value strategic insights",
    "subject": "specific subject line...",
    "message": "full message text..."
  },
  {
    "variant": "Peer Advisor Approach",
    "approach": "Share relevant proven results",
    "bestFor": "VPs and Directors who value proven results",
    "subject": "specific subject line...",
    "message": "full message text..."
  },
  {
    "variant": "Urgency Catalyst",
    "approach": "Create genuine urgency through timing",
    "bestFor": "Decision makers under growth pressure",
    "subject": "specific subject line...",
    "message": "full message text..."
  }
]`;

  // Improved fallback messages with natural language
  const getFallbackMessages = () => {
    const name = prospectInfo.name || 'there';
    const company = prospectInfo.company || 'your company';
    const title = prospectInfo.title || icp.role || 'executive';

    return [
      {
        variant: "Market Intelligence Leader",
        approach: "Lead with exclusive market insight",
        bestFor: "Senior executives who value strategic insights",
        subject: `Market trends impacting ${company}`,
        message: `Hi ${name}, I've been analyzing trends in the ${icp.industry} space that are creating new opportunities for companies like ${company}. Organizations that are proactively addressing ${icp.painPoints[0] || 'operational challenges'} are gaining significant competitive advantages. I'd like to share some specific market intelligence that could be relevant to your strategic planning. Would you be interested in a brief conversation about what I'm seeing in the market?`
      },
      {
        variant: "Peer Advisor Approach",
        approach: "Share relevant proven results",
        bestFor: "VPs and Directors who value proven results",
        subject: `Success story from similar ${icp.industry} company`,
        message: `Hi ${name}, I recently worked with another ${title} at a ${icp.industry} company facing similar challenges around ${icp.painPoints[0] || 'growth scaling'}. The results they achieved were impressive, and the approach might be relevant to ${company}'s situation. I'm curious about your perspective on these challenges and whether you'd be open to a peer-level conversation about what worked for them?`
      },
      {
        variant: "Urgency Catalyst",
        approach: "Create genuine urgency through timing",
        bestFor: "Decision makers under growth pressure",
        subject: `Time-sensitive opportunity for ${company}`,
        message: `Hi ${name}, I'm reaching out because of some timing-sensitive factors I'm seeing in the ${icp.industry} market. Companies that address ${icp.painPoints[0] || 'scaling challenges'} in the next 90 days are positioning themselves ahead of competitors who wait until next quarter. Given ${company}'s growth trajectory, this timing could be critical. Would you have 15 minutes this week to discuss the competitive landscape and timing considerations?`
      }
    ];
  };

  const fallbackMessages = getFallbackMessages();

  const messagesContent = await callOpenAI({
    model: "gpt-4",
    messages: [{ role: "user", content: messagesPrompt }],
    temperature: 0.4,
    max_tokens: 1500,
  }, fallbackMessages as unknown as Record<string, unknown>);


  return safeJsonParse(typeof messagesContent === 'string' ? messagesContent : JSON.stringify(messagesContent), fallbackMessages as unknown as Record<string, unknown>) as unknown;
}

export async function generateQualificationFramework(icp: ICPData, frameworkType: string, customContext?: string, qualificationContext?: Record<string, unknown>) {
  // World-class sales qualification expert system
  const expertSystemPrompt = `You are a world-class B2B sales qualification expert with 25+ years of enterprise sales experience and over $1B in qualified pipeline. You specialize in sophisticated discovery methodologies that uncover true buying intent and decision-making dynamics.

EXPERTISE AREAS:
- Advanced qualification methodologies (MEDDIC, CommandOfTheMessage, Challenger Sale)
- Executive stakeholder mapping and influence patterns
- Value-based selling and business case development
- Competitive differentiation and deal strategy
- Buying journey psychology and decision triggers
- Risk assessment and deal progression forecasting

QUALIFICATION PHILOSOPHY:
- Discovery drives deals - qualification is strategic intelligence gathering
- Focus on business outcomes and transformational impact
- Uncover political dynamics and decision-making power structures
- Challenge assumptions and create urgency through insight
- Position as trusted advisor, not vendor questionnaire
- Build compelling business case through systematic discovery

FRAMEWORK EXPERTISE:
- Traditional BANT (Budget, Authority, Need, Timeline)
- MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)
- CHAMP (Challenges, Authority, Money, Prioritization)
- SPICED (Situation, Pain, Impact, Critical Event, Decision)
- Value-Based Qualification (Business Impact, ROI Justification, Risk Mitigation)
- Challenger Sale (Teaching, Tailoring, Taking Control)`;

  // Enhanced qualification parameters
  const qualContext = qualificationContext || {};
  const dealComplexity = qualContext.dealComplexity || 'standard';
  const stakeholderLevel = qualContext.stakeholderLevel || 'mixed';
  const competitiveScenario = qualContext.competitiveScenario || 'unknown';

  // Generate expert-level qualification framework with single API call
  const frameworkPrompt = `Create a sophisticated ${frameworkType} qualification framework for ${icp.role} in ${icp.industry} that demonstrates true sales expertise.

Target Profile:
- Role: ${icp.role}
- Industry: ${icp.industry}
- Company Size: ${icp.companySize}
- Pain Points: ${icp.painPoints.join(', ')}
- Desired Outcomes: ${icp.outcomes.join(', ')}

Deal Context:
- Complexity: ${dealComplexity} (${dealComplexity === 'simple' ? 'Single stakeholder, clear need' : dealComplexity === 'standard' ? 'Multiple stakeholders, defined process' : dealComplexity === 'complex' ? 'Enterprise-level, multiple departments' : 'Transformational, board-level impact'})
- Stakeholder Level: ${stakeholderLevel} (${stakeholderLevel === 'individual' ? 'End users and practitioners' : stakeholderLevel === 'management' ? 'Directors and VPs' : stakeholderLevel === 'executive' ? 'C-level and senior leadership' : 'Multiple organizational levels'})
- Competitive Scenario: ${competitiveScenario} (${competitiveScenario === 'greenfield' ? 'No existing solution in place' : competitiveScenario === 'replacement' ? 'Replacing existing solution' : competitiveScenario === 'competitive' ? 'Active competition with vendors' : competitiveScenario === 'incumbent' ? 'Displacing established vendor' : 'Competitive landscape unclear'})
${customContext ? `Additional Context: ${customContext}` : ''}

Generate 5 strategic discovery questions that:
- Demonstrate industry knowledge and market expertise
- Position you as a strategic advisor, not vendor
- Uncover business drivers and competitive pressures
- Create value through the discovery process itself
- Account for the deal complexity and stakeholder dynamics above

Create 4 comprehensive scoring criteria with specific business indicators.
Include 4 clear disqualification signals based on real sales expertise.

Return ONLY valid JSON:
{
  "discoveryQuestions": [
    {
      "category": "category name",
      "question": "discovery question",
      "listenFor": ["signal1", "signal2", "signal3"],
      "followUp": "follow-up approach",
      "valueDemo": "value demonstration"
    }
  ],
  "scoringSystem": [
    {
      "criteria": "criteria name",
      "green": "positive indicators",
      "yellow": "neutral indicators",
      "red": "negative indicators",
      "weight": "high/medium/low"
    }
  ],
  "disqualifySignals": [
    "disqualification signal"
  ]
}`;

  const fallbackFramework = {
    discoveryQuestions: [
      {
        category: "Business Impact",
        question: "What's driving the urgency to solve this now?",
        listenFor: ["competitive pressure", "financial impact", "market timing"],
        followUp: "explore competitive implications",
        valueDemo: "demonstrates business understanding"
      },
      {
        category: "Decision Process",
        question: "Who else is involved in evaluating solutions?",
        listenFor: ["stakeholders", "decision criteria", "timeline"],
        followUp: "map influence and authority",
        valueDemo: "shows enterprise sales experience"
      },
      {
        category: "Budget Authority",
        question: "What's the allocated budget for this initiative?",
        listenFor: ["budget range", "approval process", "ROI expectations"],
        followUp: "confirm purchasing authority",
        valueDemo: "professional qualification approach"
      },
      {
        category: "Solution Fit",
        question: "What requirements are most critical for success?",
        listenFor: ["technical needs", "integration requirements", "success metrics"],
        followUp: "assess solution alignment",
        valueDemo: "consultative discovery"
      },
      {
        category: "Timeline Urgency",
        question: "What happens if this isn't resolved by your target date?",
        listenFor: ["business consequences", "competitive impact", "regulatory pressure"],
        followUp: "quantify cost of inaction",
        valueDemo: "value-based positioning"
      }
    ],
    scoringSystem: [
      {
        criteria: "Business Impact",
        green: "Clear ROI with executive sponsorship",
        yellow: "Moderate impact with management support",
        red: "Limited impact or unclear value",
        weight: "high"
      },
      {
        criteria: "Decision Authority",
        green: "Budget owner identified and engaged",
        yellow: "Decision process understood",
        red: "No budget authority or unclear process",
        weight: "high"
      },
      {
        criteria: "Timeline Urgency",
        green: "Urgent need with clear deadline",
        yellow: "Important but flexible timing",
        red: "No urgency or unclear timeline",
        weight: "medium"
      },
      {
        criteria: "Solution Fit",
        green: "Strong alignment with requirements",
        yellow: "Good fit with minor gaps",
        red: "Poor fit or major obstacles",
        weight: "medium"
      }
    ],
    disqualifySignals: [
      "No clear business problem or impact",
      "Budget cycles misaligned with timeline",
      "Technical requirements outside capabilities",
      "Decision maker not accessible or engaged"
    ]
  };

  const frameworkContent = await callOpenAI({
    model: "gpt-4",
    messages: [{ role: "user", content: frameworkPrompt }],
    temperature: 0.3,
    max_tokens: 1200,
  }, fallbackFramework as Record<string, unknown>);

  return safeJsonParse(typeof frameworkContent === 'string' ? frameworkContent : JSON.stringify(frameworkContent), fallbackFramework) as unknown;
}