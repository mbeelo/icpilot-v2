import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function generateObjectionRebuttal(icp: ICPData, objection: string, prospectInfo?: any) {
  const prospectContext = prospectInfo && (prospectInfo.name || prospectInfo.company || prospectInfo.title || prospectInfo.specificContext) ? `
Prospect Details:
- Name: ${prospectInfo.name || 'Not provided'}
- Company: ${prospectInfo.company || 'Not provided'}  
- Title: ${prospectInfo.title || 'Not provided'}
- Context: ${prospectInfo.specificContext || 'Not provided'}` : '';

  const companyContext = icp.companyName ? `
Your Company & Offering:
- Company: ${icp.companyName}
- Product/Service: ${icp.productService}
- Value Proposition: ${icp.valueProposition}
- Key Differentiators: ${icp.keyDifferentiators?.join(', ')}` : '';

  const prompt = `You are a world-class sales expert helping create objection rebuttals for B2B sales.
${companyContext}

ICP Context:
- Target: ${icp.role} at ${icp.companySize} companies in ${icp.industry}
- Pain Points: ${icp.painPoints.join(', ')}
- Desired Outcomes: ${icp.outcomes.join(', ')}
- Triggers: ${icp.triggers.join(', ')}
${prospectContext}

Objection: "${objection}"

Create a structured rebuttal with these 4 components, using prospect details when provided:

1. REFRAME: Acknowledge the objection and reframe it (use prospect's name naturally if provided)
2. EVIDENCE: Provide social proof or data specific to their industry/role (reference their company when relevant, and tie to your value prop)
3. BRIDGE: Connect their pain points to the cost of inaction AND how your solution addresses it (use your differentiators naturally)
4. MICRO-ASK: A small, specific question to keep the conversation moving (personalize based on their situation)

Requirements:
- Reference your company's value proposition naturally throughout
- Use your key differentiators to handle the objection
- Use prospect's name and company naturally when provided
- Reference their specific context if given
- Use natural, conversational language
- Be specific to their industry and role
- Make the micro-ask relevant to the objection
- Keep each section concise but impactful

Format as JSON:
{
  "reframe": "...",
  "evidence": "...", 
  "bridge": "...",
  "microAsk": "..."
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw error;
  }
}

export async function generateMessages(icp: ICPData, messageType: string, trigger: string, prospectInfo: any) {
  const companyContext = icp.companyName ? `
Your Company & Offering:
- Company: ${icp.companyName}
- Product/Service: ${icp.productService}
- Value Proposition: ${icp.valueProposition}
- Key Differentiators: ${icp.keyDifferentiators?.join(', ')}` : '';

  const prompt = `You are a world-class sales copywriter creating personalized outreach messages.
${companyContext}

ICP Context:
- Target: ${icp.role} at ${icp.companySize} companies in ${icp.industry}
- Pain Points: ${icp.painPoints.join(', ')}
- Desired Outcomes: ${icp.outcomes.join(', ')}
- Common Triggers: ${icp.triggers.join(', ')}

Message Details:
- Type: ${messageType}
- Trigger Event: ${trigger}
- Prospect: ${prospectInfo.name} (${prospectInfo.title}) at ${prospectInfo.company}
- Context: ${prospectInfo.specificContext || 'None provided'}

Create 3 different message variants for this ${messageType}:

Requirements:
- Reference the trigger event naturally
- Connect to their likely pain points
- Position your solution using your value proposition
- Weave in your differentiators naturally (don't list them, make them part of the story)
- Keep appropriate length for message type
- Include clear value proposition
- End with soft call-to-action
- Use prospect's name and company
- Make each variant feel different (tone, approach, length)
- CRITICAL: Make it about THEM and their challenges, not about you/your product

Format as JSON array:
[
  {
    "subject": "...",
    "message": "...",
    "variant": "Direct & Brief"
  },
  {
    "subject": "...", 
    "message": "...",
    "variant": "Value-Focused"
  },
  {
    "subject": "...",
    "message": "...", 
    "variant": "Question-Based"
  }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw error;
  }
}

export async function generateQualificationFramework(icp: ICPData, frameworkType: string, customContext?: string) {
  const contextSection = customContext ? `
Additional Context: ${customContext}` : '';

  const companyContext = icp.companyName ? `
Your Company & Offering:
- Company: ${icp.companyName}
- Product/Service: ${icp.productService}
- Value Proposition: ${icp.valueProposition}
- Key Differentiators: ${icp.keyDifferentiators?.join(', ')}` : '';

  const prompt = `You are a world-class sales expert creating a comprehensive qualification framework for B2B sales.
${companyContext}

ICP Context:
- Target: ${icp.role} at ${icp.companySize} companies in ${icp.industry}
- Pain Points: ${icp.painPoints.join(', ')}
- Desired Outcomes: ${icp.outcomes.join(', ')}
- Common Triggers: ${icp.triggers.join(', ')}
${contextSection}

Framework Type: ${frameworkType}

Create a comprehensive qualification framework with these components:

1. DISCOVERY QUESTIONS: 5-7 strategic questions that uncover fit, organized by category. Questions should reveal whether they have the pain points your solution addresses.
2. SCORING SYSTEM: Clear criteria for green/yellow/red scoring across key areas. Include whether they're a fit for your specific solution.
3. DISQUALIFY SIGNALS: 4-6 automatic disqualifiers specific to this ICP and your offering (e.g., if they already have a solution that does what yours does, if they don't have the pain points you solve)

Requirements:
- Questions should uncover alignment with your value proposition
- Questions should be open-ended and strategic
- Scoring criteria should be specific and actionable
- Include what to "listen for" in their responses
- Disqualifiers should be ICP-specific deal breakers AND solution-specific (people who won't benefit from what you offer)
- Framework should align with the chosen methodology
- Make it practical for real sales conversations

Format as JSON:
{
  "discoveryQuestions": [
    {
      "category": "Budget/Authority/Need/etc",
      "question": "Question text",
      "listenFor": ["signal 1", "signal 2", "signal 3"]
    }
  ],
  "scoringSystem": [
    {
      "criteria": "Criteria name",
      "green": "Green condition",
      "yellow": "Yellow condition", 
      "red": "Red condition"
    }
  ],
  "disqualifySignals": [
    "Disqualifier 1",
    "Disqualifier 2"
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw error;
  }
}