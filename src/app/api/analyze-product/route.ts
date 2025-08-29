import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { scrapeWebsite } from '@/lib/scraper';
import { analyzeProduct, generateMarketingIdeas } from '@/lib/ai-analyzer';

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { productUrl, productName, tagline } = body;

    if (!productUrl || !productName) {
      return NextResponse.json(
        { error: 'Product URL and name are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(productUrl.startsWith('http') ? productUrl : `https://${productUrl}`);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Step 1: Scrape the website
    console.log('🔍 Scraping website:', productUrl);
    const scrapedData = await scrapeWebsite(productUrl);

    // Step 2: Analyze with AI (if OpenAI key is available)
    console.log('🤖 Analyzing with AI...');
    let aiAnalysis = null;
    let marketingIdeas = null;
    
    if (process.env.OPENAI_API_KEY) {
      try {
        aiAnalysis = await analyzeProduct(scrapedData, productUrl);
        marketingIdeas = await generateMarketingIdeas(aiAnalysis, productName);
      } catch (aiError) {
        console.warn('AI analysis failed, proceeding without it:', aiError);
      }
    }

    // Step 3: Create the app in database
    const app = await db.app.create({
      data: {
        name: productName,
        tagline: tagline || aiAnalysis?.valueProposition?.substring(0, 100) || scrapedData.description?.substring(0, 100) || `${productName} - innovative solution`,
        description: aiAnalysis?.valueProposition || scrapedData.description || `${productName} - innovative solution`,
        url: productUrl,
        logoUrl: scrapedData.logoUrl || scrapedData.images?.[0]?.src || null,
        category: 'OTHER', // Can be improved with AI classification
        stage: 'LAUNCHED', // Assume launched if has website
        status: 'ACTIVE',
        userId,
      },
    });

    // Step 3.5: Store comprehensive scraped data
    let scrapedDataRecord = null;
    try {
      scrapedDataRecord = await db.scrapedData.create({
        data: {
          appId: app.id,
          title: scrapedData.title,
          description: scrapedData.description,
          content: scrapedData.content,
          url: scrapedData.url,
          
          // Meta Information
          metaTags: scrapedData.metaTags,
          openGraphData: scrapedData.openGraphData,
          twitterCardData: scrapedData.twitterCardData,
          jsonLdData: scrapedData.jsonLdData,
          
          // Content Structure
          headings: scrapedData.headings,
          paragraphs: scrapedData.paragraphs,
          lists: scrapedData.lists,
          
          // Features & Benefits
          features: scrapedData.features,
          benefits: scrapedData.benefits,
          pricing: scrapedData.pricing,
          testimonials: scrapedData.testimonials,
          
          // Media & Assets
          images: scrapedData.images,
          videos: scrapedData.videos,
          documents: scrapedData.documents,
          logoUrl: scrapedData.logoUrl,
          favicon: scrapedData.favicon,
          
          // Contact & Social
          socialLinks: scrapedData.socialLinks,
          contactInfo: scrapedData.contactInfo,
          
          // Technical Information
          technologies: scrapedData.technologies,
          performanceMetrics: scrapedData.performanceMetrics,
          seoScore: scrapedData.seoScore,
          mobileOptimized: scrapedData.mobileOptimized,
          httpsEnabled: scrapedData.httpsEnabled,
          
          // Content Analysis
          wordCount: scrapedData.wordCount,
          readingTime: scrapedData.readingTime,
          languageDetected: scrapedData.languageDetected,
          keywords: scrapedData.keywords,
          sentiment: scrapedData.sentiment,
          
          // Business Information
          companyInfo: scrapedData.companyInfo,
          businessModel: scrapedData.businessModel,
          industryCategory: scrapedData.industryCategory,
          
          // Navigation & Structure
          navigationMenu: scrapedData.navigationMenu,
          footerLinks: scrapedData.footerLinks,
          internalLinks: scrapedData.internalLinks,
          externalLinks: scrapedData.externalLinks,
          
          // E-commerce
          products: scrapedData.products,
          categories: scrapedData.categories,
          paymentMethods: scrapedData.paymentMethods,
          shippingInfo: scrapedData.shippingInfo,
          
          // Analytics & Tracking
          analyticsTools: scrapedData.analyticsTools,
          trackingPixels: scrapedData.trackingPixels,
          
          // Quality Metrics
          scrapeQuality: scrapedData.scrapeQuality,
          completeness: scrapedData.completeness,
          scrapeDuration: scrapedData.performanceMetrics.scrapeTime,
        },
      });
      
      console.log('✅ Comprehensive scraped data stored successfully');
    } catch (scrapedDataError) {
      console.error('Failed to store scraped data:', scrapedDataError);
      // Continue without scraped data in database
    }

    // Step 4: Store AI analysis in AppKnowledge (if available)
    let appKnowledge = null;
    if (aiAnalysis) {
      try {
        appKnowledge = await db.appKnowledge.create({
          data: {
            appId: app.id,
            valueProposition: aiAnalysis.valueProposition,
            targetAudience: aiAnalysis.targetAudience,
            keyFeatures: aiAnalysis.keyFeatures,
            uniqueSellingPoints: aiAnalysis.uniqueSellingPoints,
            marketSize: aiAnalysis.marketSize,
            competitiveAdvantage: aiAnalysis.competitiveAdvantage,
            pricingStrategy: aiAnalysis.pricingStrategy,
            revenueModel: aiAnalysis.revenueModel,
            painPoints: aiAnalysis.painPoints,
            benefits: aiAnalysis.benefits,
            emotionalTriggers: aiAnalysis.emotionalTriggers,
            messagingFramework: aiAnalysis.messagingFramework,
            primaryKeywords: aiAnalysis.primaryKeywords,
            longTailKeywords: aiAnalysis.longTailKeywords,
            contentThemes: aiAnalysis.contentThemes,
            brandTone: aiAnalysis.brandTone,
            brandPersonality: aiAnalysis.brandPersonality,
            communicationStyle: aiAnalysis.communicationStyle,
            brandGuidelines: aiAnalysis.brandGuidelines,
            confidenceScore: aiAnalysis.confidenceScore,
            analysisVersion: '2.0',
          },
        });
      } catch (dbError) {
        console.error('Failed to store AI analysis:', dbError);
        // Continue without AI analysis in database
      }
    } else {
      // Create basic knowledge entry from scraped data
      try {
        appKnowledge = await db.appKnowledge.create({
          data: {
            appId: app.id,
            valueProposition: scrapedData.description || `${productName} - innovative solution`,
            targetAudience: 'professionals and businesses',
            keyFeatures: scrapedData.features.slice(0, 5),
            uniqueSellingPoints: [scrapedData.title || productName],
            primaryKeywords: scrapedData.headings.slice(0, 5),
            analysisVersion: '1.0',
            confidenceScore: 0.5,
          },
        });
      } catch (dbError) {
        console.error('Failed to store basic knowledge:', dbError);
      }
    }

    // Step 5: Create sample posts (if marketing ideas available)
    const samplePosts: Array<{
      id: string;
      content: string;
      platform: string;
      status: string;
      scheduledFor?: Date;
    }> = [];
    if (marketingIdeas && marketingIdeas.tweetTemplates.length > 0) {
      try {
        // Find or create a social account placeholder (will be updated when real account is connected)
        for (let i = 0; i < Math.min(3, marketingIdeas.tweetTemplates.length); i++) {
          const tweetTemplate = marketingIdeas.tweetTemplates[i];
          const hashtags = marketingIdeas.hashtagSuggestions.slice(i * 2, (i * 2) + 3);
          
          // For now, we'll create posts without socialAccountId (to be set later)
          // In production, you might want to handle this differently
        }
      } catch (postError) {
        console.error('Failed to create sample posts:', postError);
      }
    }

    // Step 6: Return comprehensive analysis
    const responseData = {
      app: {
        id: app.id,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        url: app.url,
        logoUrl: app.logoUrl,
        category: app.category,
        stage: app.stage,
        status: app.status.toLowerCase(),
        createdAt: app.createdAt.toISOString(),
      },
      analysis: {
        scrapedData: {
          // Basic Information
          title: scrapedData.title,
          description: scrapedData.description,
          content: scrapedData.content.substring(0, 1000) + (scrapedData.content.length > 1000 ? '...' : ''),
          url: scrapedData.url,
          
          // Content Structure
          headings: scrapedData.headings.slice(0, 10),
          paragraphs: scrapedData.paragraphs.slice(0, 5),
          lists: scrapedData.lists.slice(0, 10),
          
          // Features & Benefits
          features: scrapedData.features.slice(0, 15),
          benefits: scrapedData.benefits.slice(0, 10),
          pricing: scrapedData.pricing.slice(0, 8),
          testimonials: scrapedData.testimonials.slice(0, 5),
          
          // Media & Assets
          images: scrapedData.images.slice(0, 10),
          videos: scrapedData.videos.slice(0, 5),
          logoUrl: scrapedData.logoUrl,
          favicon: scrapedData.favicon,
          
          // Contact & Social
          socialLinks: scrapedData.socialLinks.slice(0, 10),
          contactInfo: scrapedData.contactInfo,
          
          // Technical Information
          technologies: scrapedData.technologies,
          seoScore: scrapedData.seoScore,
          mobileOptimized: scrapedData.mobileOptimized,
          httpsEnabled: scrapedData.httpsEnabled,
          
          // Content Analysis
          wordCount: scrapedData.wordCount,
          readingTime: scrapedData.readingTime,
          languageDetected: scrapedData.languageDetected,
          keywords: scrapedData.keywords.slice(0, 15),
          sentiment: scrapedData.sentiment,
          
          // Business Information
          companyInfo: scrapedData.companyInfo,
          businessModel: scrapedData.businessModel,
          industryCategory: scrapedData.industryCategory,
          
          // Navigation & Structure
          navigationMenu: scrapedData.navigationMenu.slice(0, 10),
          footerLinks: scrapedData.footerLinks.slice(0, 10),
          
          // E-commerce
          categories: scrapedData.categories.slice(0, 10),
          paymentMethods: scrapedData.paymentMethods,
          
          // Analytics & Tools
          analyticsTools: scrapedData.analyticsTools,
          
          // Quality Metrics
          scrapeQuality: scrapedData.scrapeQuality,
          completeness: scrapedData.completeness,
          
          // Performance
          performanceMetrics: scrapedData.performanceMetrics,
        },
        ...(aiAnalysis && {
          aiInsights: {
            valueProposition: aiAnalysis.valueProposition,
            targetAudience: aiAnalysis.targetAudience,
            keyFeatures: aiAnalysis.keyFeatures.slice(0, 5),
            uniqueSellingPoints: aiAnalysis.uniqueSellingPoints,
            competitiveAdvantage: aiAnalysis.competitiveAdvantage,
            confidenceScore: aiAnalysis.confidenceScore,
          },
        }),
        knowledge: appKnowledge,
      },
      ...(marketingIdeas && {
        marketingKit: {
          twitterPosts: marketingIdeas.tweetTemplates.slice(0, 5).map((content, index) => ({
            content,
            hashtags: marketingIdeas.hashtagSuggestions.slice(index * 2, (index * 2) + 3),
            charCount: content.length,
          })),
          contentIdeas: marketingIdeas.contentIdeas,
          hashtagSuggestions: marketingIdeas.hashtagSuggestions,
          growthTactics: marketingIdeas.growthTactics,
        },
      }),
      samplePosts,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      hasAI: !!process.env.OPENAI_API_KEY,
      message: process.env.OPENAI_API_KEY 
        ? 'Product analyzed successfully with AI insights!' 
        : 'Product analyzed successfully! Add OPENAI_API_KEY for AI-powered insights.'
    });

  } catch (error) {
    const isAuth = (error as Error)?.message === 'Not authenticated';
    if (isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.error('Product analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}