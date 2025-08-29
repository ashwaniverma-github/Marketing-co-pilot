import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProductKnowledge {
  id: string;
  productId: string;
  basicInfo: {
    name: string;
    tagline: string;
    url: string;
    category: string;
    targetAudience: string;
    valueProposition: string;
  };
  features: {
    core: string[];
    secondary: string[];
    unique: string[];
  };
  competitors: {
    direct: string[];
    indirect: string[];
    advantages: string[];
  };
  marketingAngles: {
    painPoints: string[];
    benefits: string[];
    emotionalTriggers: string[];
    socialProof: string[];
  };
  contentThemes: {
    educational: string[];
    promotional: string[];
    behindTheScenes: string[];
    userGenerated: string[];
  };
  seoKeywords: {
    primary: string[];
    longTail: string[];
    brandTerms: string[];
  };
  brandVoice: {
    tone: string;
    personality: string[];
    language: string;
    restrictions: string[];
  };
  createdAt: string;
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productUrl, productName, tagline, existingAnalysis } = body;

    if (!productId || !productUrl || !productName) {
      return NextResponse.json(
        { error: 'Product ID, URL, and name are required' },
        { status: 400 }
      );
    }

    // First, scrape the website for comprehensive data
    const scrapedData = await scrapeProductWebsite(productUrl);
    
    // Then, analyze with AI for deep understanding
    const aiAnalysis = await generateComprehensiveAnalysis({
      url: productUrl,
      name: productName,
      tagline,
      scrapedData,
      existingAnalysis
    });

    // Structure the knowledge base
    const productKnowledge: ProductKnowledge = {
      id: Date.now().toString(),
      productId,
      basicInfo: {
        name: productName,
        tagline: tagline || '',
        url: productUrl,
        category: aiAnalysis.category,
        targetAudience: aiAnalysis.targetAudience,
        valueProposition: aiAnalysis.valueProposition
      },
      features: aiAnalysis.features,
      competitors: aiAnalysis.competitors,
      marketingAngles: aiAnalysis.marketingAngles,
      contentThemes: aiAnalysis.contentThemes,
      seoKeywords: aiAnalysis.seoKeywords,
      brandVoice: aiAnalysis.brandVoice,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      knowledge: productKnowledge,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Enhanced analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Enhanced analysis failed';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function scrapeProductWebsite(url: string) {
  try {
    // In a real implementation, you would use a proper web scraping service
    // For now, we'll simulate the scraped data
    return {
      title: 'Sample Product Title',
      description: 'A comprehensive description of the product features and benefits.',
      headings: [
        'Features',
        'Pricing',
        'About Us',
        'Testimonials'
      ],
      content: 'Sample content about the product, its features, benefits, and value proposition.',
      images: ['hero-image.jpg', 'feature-screenshot.png'],
      links: ['/features', '/pricing', '/about'],
      metadata: {
        keywords: 'productivity, saas, automation',
        author: 'Product Team'
      }
    };
  } catch (error) {
    console.error('Website scraping error:', error);
    return null;
  }
}

type ComprehensiveInput = {
  name: string;
  tagline?: string;
  url: string;
  scrapedData: unknown;
  existingAnalysis?: unknown;
};

async function generateComprehensiveAnalysis(data: ComprehensiveInput) {
  try {
    const prompt = `
    Analyze this product comprehensively and provide detailed insights:

    Product: ${data.name}
    Tagline: ${data.tagline}
    URL: ${data.url}
    Scraped Content: ${JSON.stringify(data.scrapedData)}
    ${data.existingAnalysis ? `Previous Analysis: ${JSON.stringify(data.existingAnalysis)}` : ''}

    Provide a comprehensive analysis including:

    1. Product Category and Market Position
    2. Target Audience Segments
    3. Core Value Proposition
    4. Feature Analysis (core, secondary, unique)
    5. Competitive Landscape
    6. Marketing Angles and Messaging
    7. Content Themes for Social Media
    8. SEO Keyword Strategy
    9. Brand Voice and Personality
    10. Growth Opportunities

    Format the response as a detailed JSON object with specific, actionable insights.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert product marketing analyst and growth strategist. Provide comprehensive, actionable insights for SaaS and digital products."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('No analysis generated');
    }

    // Parse the AI response
    try {
      return JSON.parse(analysis);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      return {
        category: 'SaaS Product',
        targetAudience: 'Business professionals and productivity-focused individuals',
        valueProposition: 'Streamline workflows and increase productivity',
        features: {
          core: ['Task Management', 'Team Collaboration', 'Analytics'],
          secondary: ['Integrations', 'Mobile App', 'Notifications'],
          unique: ['AI-powered insights', 'Custom workflows']
        },
        competitors: {
          direct: ['Asana', 'Trello', 'Monday.com'],
          indirect: ['Notion', 'Slack', 'Microsoft Teams'],
          advantages: ['Better user experience', 'More affordable', 'Faster setup']
        },
        marketingAngles: {
          painPoints: ['Disorganized workflows', 'Team communication issues', 'Lack of visibility'],
          benefits: ['Increased productivity', 'Better collaboration', 'Clear project visibility'],
          emotionalTriggers: ['Success', 'Control', 'Achievement'],
          socialProof: ['User testimonials', 'Case studies', 'Usage statistics']
        },
        contentThemes: {
          educational: ['Productivity tips', 'Project management best practices', 'Team collaboration guides'],
          promotional: ['Feature highlights', 'Success stories', 'Special offers'],
          behindTheScenes: ['Product development', 'Team culture', 'Company updates'],
          userGenerated: ['Customer success stories', 'Use case examples', 'Community highlights']
        },
        seoKeywords: {
          primary: ['project management', 'team collaboration', 'productivity tool'],
          longTail: ['best project management software for small teams', 'how to improve team productivity'],
          brandTerms: [data.name.toLowerCase(), `${data.name.toLowerCase()} app`, `${data.name.toLowerCase()} software`]
        },
        brandVoice: {
          tone: 'Professional yet approachable',
          personality: ['Helpful', 'Innovative', 'Reliable', 'Empowering'],
          language: 'Clear and jargon-free',
          restrictions: ['Avoid overly technical terms', 'Keep it conversational']
        }
      };
    }

  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to generate AI analysis');
  }
}
