import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { scrapeWebsite } from '@/lib/scraper';

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

    // Step 1: Scrape the website for comprehensive data
    console.log('🔍 Scraping website:', productUrl);
    const scrapedData = await scrapeWebsite(productUrl);

    // Step 2: Create the app in database
    const app = await db.app.create({
      data: {
        name: productName,
        tagline: tagline || scrapedData.description?.substring(0, 100) || `${productName} - innovative solution`,
        description: scrapedData.description || `${productName} - innovative solution`,
        url: productUrl,
        logoUrl: scrapedData.logoUrl || scrapedData.images?.[0]?.src || null,
        category: 'OTHER', // Can be improved with manual classification
        stage: 'LAUNCHED', // Assume launched if has website
        status: 'ACTIVE',
        userId,
      },
    });

    // Step 3: Store comprehensive scraped data
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

    // Prepare response data
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
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      },
      scrapedData: {
        title: scrapedData.title,
        description: scrapedData.description,
        features: scrapedData.features.slice(0, 8),
        benefits: scrapedData.benefits.slice(0, 6),
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
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Product analyzed and stored successfully!'
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