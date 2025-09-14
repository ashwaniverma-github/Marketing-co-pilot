import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productName, productUrl, messages, tweetMode } = body as {
      productId: string; productName: string; productUrl: string; messages: { role: string; content: string }[]; tweetMode?: boolean;
    };

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    // Pull context: scraped data for AI chat
    const scraped = await db.scrapedData.findUnique({ where: { appId: productId } });

    const system = `You are a concise marketing assistant. Answer with actionable, platform-ready suggestions.

IMPORTANT FORMATTING RULES:
- Do NOT use emojis unless the user explicitly asks for them
- Do NOT include hashtags unless the user specifically requests them
- Use clean, professional language
- Format lists with numbers or bullets when appropriate
- Use **bold** for emphasis when needed
${tweetMode ? `
TWEET MODE ACTIVE:
- Generate exactly 4 different tweet options separated by "---TWEET---"
- Each tweet should be under 280 characters
- Make each tweet unique with different angles/approaches
- Use conversational, engaging tone suitable for social media
- Focus on one key point per tweet
- Example format: Tweet 1 content ---TWEET--- Tweet 2 content ---TWEET--- Tweet 3 content ---TWEET--- Tweet 4 content` : ''}

Product: ${productName}
URL: ${productUrl}

Product Information: ${JSON.stringify(scraped ? {
  title: scraped.title,
  description: scraped.description,
  features: scraped.features,
  benefits: scraped.benefits,
  pricing: scraped.pricing,
  testimonials: scraped.testimonials,
  keywords: scraped.keywords,
  businessModel: scraped.businessModel,
  technologies: scraped.technologies,
  navigationMenu: scraped.navigationMenu,
  companyInfo: scraped.companyInfo,
  wordCount: scraped.wordCount,
  seoScore: scraped.seoScore,
  mobileOptimized: scraped.mobileOptimized,
  httpsEnabled: scraped.httpsEnabled,
} : {})}`;

    // Create a streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        ...messages.map((m: any) => ({ 
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', 
          content: String(m.content || '') 
        })),
      ],
      temperature: 0.7,
      max_tokens: 600,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      }
    });

    // Return the streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (e) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}


