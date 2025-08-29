import OpenAI from 'openai';
import { ScrapedData } from './scraper';

export interface AnalyzedProduct {
  valueProposition: string;
  targetAudience: string;
  keyFeatures: string[];
  uniqueSellingPoints: string[];
  marketSize: string;
  competitiveAdvantage: string;
  pricingStrategy: string;
  revenueModel: string;
  painPoints: string[];
  benefits: string[];
  emotionalTriggers: string[];
  messagingFramework: {
    elevator_pitch: string;
    key_messages: string[];
    call_to_action: string;
    value_statements: string[];
  };
  primaryKeywords: string[];
  longTailKeywords: string[];
  contentThemes: string[];
  brandTone: string;
  brandPersonality: string[];
  communicationStyle: string;
  brandGuidelines: {
    voice_characteristics: string[];
    do_say: string[];
    dont_say: string[];
    style_notes: string[];
  };
  confidenceScore: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeProduct(scrapedData: ScrapedData, productUrl: string): Promise<AnalyzedProduct> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Analyze this product/app data and provide a comprehensive marketing analysis. Focus on indie hacker marketing for X (Twitter).

SCRAPED DATA:
- Title: ${scrapedData.title}
- Description: ${scrapedData.description}
- URL: ${productUrl}
- Features: ${scrapedData.features.join(', ')}
- Pricing: ${scrapedData.pricing.join(', ')}
- Content Preview: ${scrapedData.content.substring(0, 1000)}
- Headings: ${scrapedData.headings.slice(0, 10).join(', ')}

Please provide a JSON response with the following structure (no extra text, just valid JSON):

{
  "valueProposition": "Clear, compelling value proposition in 1-2 sentences",
  "targetAudience": "Specific description of the primary target audience",
  "keyFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "uniqueSellingPoints": ["usp1", "usp2", "usp3"],
  "marketSize": "Brief market size/opportunity assessment",
  "competitiveAdvantage": "What makes this product unique in the market",
  "pricingStrategy": "Analysis of pricing approach and positioning",
  "revenueModel": "How the business makes money",
  "painPoints": ["pain1", "pain2", "pain3", "pain4"],
  "benefits": ["benefit1", "benefit2", "benefit3", "benefit4"],
  "emotionalTriggers": ["trigger1", "trigger2", "trigger3"],
  "messagingFramework": {
    "elevator_pitch": "30-second pitch for the product",
    "key_messages": ["message1", "message2", "message3"],
    "call_to_action": "Primary CTA for marketing",
    "value_statements": ["value1", "value2", "value3"]
  },
  "primaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "longTailKeywords": ["long tail 1", "long tail 2", "long tail 3"],
  "contentThemes": ["theme1", "theme2", "theme3", "theme4"],
  "brandTone": "professional/casual/friendly/authoritative/playful",
  "brandPersonality": ["trait1", "trait2", "trait3"],
  "communicationStyle": "Description of how the brand should communicate",
  "brandGuidelines": {
    "voice_characteristics": ["characteristic1", "characteristic2"],
    "do_say": ["phrase1", "phrase2"],
    "dont_say": ["avoid1", "avoid2"],
    "style_notes": ["note1", "note2"]
  },
  "confidenceScore": 0.85
}

Focus on:
- Indie hacker perspective
- X (Twitter) marketing optimization
- Growth-focused messaging
- Technical accuracy
- Actionable insights
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing analyst specializing in indie hacker products and X (Twitter) marketing. Provide detailed, actionable analysis in valid JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response and parse JSON
    const cleanedContent = content.trim().replace(/```json\n?|\n?```/g, '');
    
    try {
      const analysis: AnalyzedProduct = JSON.parse(cleanedContent);
      
      // Validate required fields
      if (!analysis.valueProposition || !analysis.targetAudience) {
        throw new Error('Missing required analysis fields');
      }
      
      // Ensure arrays are not empty and have reasonable limits
      analysis.keyFeatures = analysis.keyFeatures?.slice(0, 10) || [];
      analysis.uniqueSellingPoints = analysis.uniqueSellingPoints?.slice(0, 5) || [];
      analysis.painPoints = analysis.painPoints?.slice(0, 8) || [];
      analysis.benefits = analysis.benefits?.slice(0, 8) || [];
      analysis.emotionalTriggers = analysis.emotionalTriggers?.slice(0, 5) || [];
      analysis.primaryKeywords = analysis.primaryKeywords?.slice(0, 10) || [];
      analysis.longTailKeywords = analysis.longTailKeywords?.slice(0, 10) || [];
      analysis.contentThemes = analysis.contentThemes?.slice(0, 8) || [];
      analysis.brandPersonality = analysis.brandPersonality?.slice(0, 5) || [];
      
      // Ensure confidence score is reasonable
      analysis.confidenceScore = Math.min(Math.max(analysis.confidenceScore || 0.5, 0.1), 1.0);
      
      return analysis;
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', cleanedContent);
      throw new Error('Failed to parse AI analysis response');
    }

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateMarketingIdeas(analysis: AnalyzedProduct, productName: string): Promise<{
  tweetTemplates: string[];
  contentIdeas: string[];
  hashtagSuggestions: string[];
  growthTactics: string[];
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Generate X (Twitter) marketing content for "${productName}" based on this analysis:

Value Prop: ${analysis.valueProposition}
Target: ${analysis.targetAudience}
Features: ${analysis.keyFeatures.join(', ')}
Pain Points: ${analysis.painPoints.join(', ')}
Benefits: ${analysis.benefits.join(', ')}

Provide JSON response:
{
  "tweetTemplates": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"],
  "contentIdeas": ["idea1", "idea2", "idea3", "idea4"],
  "hashtagSuggestions": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "growthTactics": ["tactic1", "tactic2", "tactic3", "tactic4"]
}

Make tweets:
- Under 280 characters
- Include call-to-action
- Use indie hacker language
- Focus on problems/solutions
- Include relevant hashtags
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an X (Twitter) marketing expert for indie hackers. Generate engaging, authentic content in JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const cleanedContent = content.trim().replace(/```json\n?|\n?```/g, '');
    const ideas = JSON.parse(cleanedContent);
    
    return {
      tweetTemplates: ideas.tweetTemplates?.slice(0, 8) || [],
      contentIdeas: ideas.contentIdeas?.slice(0, 6) || [],
      hashtagSuggestions: ideas.hashtagSuggestions?.slice(0, 10) || [],
      growthTactics: ideas.growthTactics?.slice(0, 6) || [],
    };

  } catch (error) {
    console.error('Marketing ideas generation error:', error);
    return {
      tweetTemplates: [],
      contentIdeas: [],
      hashtagSuggestions: [],
      growthTactics: [],
    };
  }
}
