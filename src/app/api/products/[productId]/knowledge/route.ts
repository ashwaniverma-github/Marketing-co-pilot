// src/app/api/products/[productId]/knowledge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Dev tip: avoid creating many PrismaClient instances during hot reloads
const prisma =
  (global as any).prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  (global as any).prisma = prisma;
}

// Use RouteContext for better typing (RouteContext is available globally)
export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/products/[productId]/knowledge'>
) {
  try {
    // ✅ Await the params object, then destructure
    const { productId } = await context.params;

    // First, find the associated App for this Product
    const product = await prisma.app.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });

    if (!product) {
      console.error(`Product not found with ID: ${productId}`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log(`Found product: ${JSON.stringify(product)}`);

    // Fetch the ScrapedData for the associated App
    const scrapedData = await prisma.scrapedData.findFirst({
      where: { 
        OR: [
          // Try direct association
          { appId: product.id },
          // Try through posts association
          { 
            app: {
              posts: {
                some: { appId: product.id }
              }
            }
          }
        ]
      }
    });

    console.log(`Scraped Data Query Result: ${JSON.stringify(scrapedData)}`);

    if (!scrapedData) {
      // Log all ScrapedData entries to help diagnose
      const allScrapedData = await prisma.scrapedData.findMany({
        take: 10,
        select: { id: true, appId: true, title: true }
      });
      console.error(`No scraped data found for product ID: ${productId}`);
      console.error(`Sample ScrapedData entries: ${JSON.stringify(allScrapedData)}`);
      
      return NextResponse.json({ 
        error: 'No scraped data found for this product',
        productId: product.id,
        productName: product.name,
        sampleScrapedData: allScrapedData
      }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      title: scrapedData.title,
      description: scrapedData.description,
      url: scrapedData.url,
      features: scrapedData.features,
      benefits: scrapedData.benefits,
      technologies: scrapedData.technologies,
      keywords: scrapedData.keywords,
      businessModel: scrapedData.businessModel,
      industryCategory: scrapedData.industryCategory,
      companyInfo: scrapedData.companyInfo,
      socialLinks: scrapedData.socialLinks,
      contactInfo: scrapedData.contactInfo,
      performanceMetrics: scrapedData.performanceMetrics,
      seoScore: scrapedData.seoScore,
      mobileOptimized: scrapedData.mobileOptimized,
      lastScrapedAt: scrapedData.lastScrapedAt,
      pricing: scrapedData.pricing,
      paymentMethods: scrapedData.paymentMethods
    });
  } catch (error) {
    console.error('Error fetching product knowledge:', error);
    return NextResponse.json({ error: 'Failed to fetch product knowledge' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<'/api/products/[productId]/knowledge'>
) {
  try {
    // ✅ Await params here too
    const { productId } = await context.params;
    const knowledgeData = await request.json();

    const { description, pricing, paymentMethods, ...otherKnowledge } = knowledgeData;

    const updatedProduct = await prisma.app.update({
      where: { id: productId },
      data: {
        description: description || undefined,
        scrapedData: {
          upsert: {
            create: {
              title: otherKnowledge.title || '',
              url: otherKnowledge.url || '',
              pricing: pricing || [],
              paymentMethods: paymentMethods || [],
              ...otherKnowledge
            },
            update: {
              pricing: pricing || undefined,
              paymentMethods: paymentMethods || undefined,
              ...otherKnowledge
            }
          }
        }
      },
      include: { scrapedData: true }
    });

    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      title: updatedProduct.scrapedData?.title,
      description: updatedProduct.description,
      url: updatedProduct.scrapedData?.url,
      features: updatedProduct.scrapedData?.features,
      benefits: updatedProduct.scrapedData?.benefits,
      technologies: updatedProduct.scrapedData?.technologies,
      keywords: updatedProduct.scrapedData?.keywords,
      businessModel: updatedProduct.scrapedData?.businessModel,
      industryCategory: updatedProduct.scrapedData?.industryCategory,
      companyInfo: updatedProduct.scrapedData?.companyInfo,
      socialLinks: updatedProduct.scrapedData?.socialLinks,
      contactInfo: updatedProduct.scrapedData?.contactInfo,
      performanceMetrics: updatedProduct.scrapedData?.performanceMetrics,
      seoScore: updatedProduct.scrapedData?.seoScore,
      mobileOptimized: updatedProduct.scrapedData?.mobileOptimized,
      lastScrapedAt: updatedProduct.scrapedData?.lastScrapedAt,
      pricing: updatedProduct.scrapedData?.pricing,
      paymentMethods: updatedProduct.scrapedData?.paymentMethods
    });
  } catch (error) {
    console.error('Error updating product knowledge:', error);
    return NextResponse.json({
      error: 'Failed to update product knowledge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
