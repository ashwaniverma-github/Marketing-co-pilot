import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  // Basic Information
  title: string;
  description: string;
  content: string;
  url: string;
  
  // Meta Information
  metaTags: { [key: string]: string };
  openGraphData: { [key: string]: string };
  twitterCardData: { [key: string]: string };
  jsonLdData: any[];
  
  // Content Structure
  headings: string[];
  paragraphs: string[];
  lists: string[];
  
  // Features & Benefits
  features: string[];
  benefits: string[];
  pricing: string[];
  testimonials: string[];
  
  // Media & Assets
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  videos: string[];
  documents: string[];
  logoUrl: string | null;
  favicon: string | null;
  
  // Contact & Social
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
  };
  
  // Technical Information
  technologies: string[];
  performanceMetrics: {
    scrapeTime: number;
    responseTime?: number;
    pageSize?: number;
  };
  seoScore: number;
  mobileOptimized: boolean;
  httpsEnabled: boolean;
  
  // Content Analysis
  wordCount: number;
  readingTime: number;
  languageDetected: string;
  keywords: string[];
  sentiment: string;
  
  // Business Information
  companyInfo: {
    name?: string;
    description?: string;
    location?: string;
    teamSize?: string;
    founded?: string;
  };
  businessModel: string | null;
  industryCategory: string | null;
  
  // Navigation & Structure
  navigationMenu: string[];
  footerLinks: string[];
  internalLinks: string[];
  externalLinks: string[];
  
  // E-commerce
  products: any[];
  categories: string[];
  paymentMethods: string[];
  shippingInfo: string | null;
  
  // Analytics & Tracking
  analyticsTools: string[];
  trackingPixels: string[];
  
  // Quality Metrics
  scrapeQuality: number;
  completeness: number;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const startTime = Date.now();
  
  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    const scrapeTime = Date.now() - startTime;

    // === BASIC INFORMATION ===
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('h1').first().text().trim() || 
                  'Unknown Title';

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('p').first().text().trim() || 
                       '';

    // === META INFORMATION ===
    const metaTags: { [key: string]: string } = {};
    const openGraphData: { [key: string]: string } = {};
    const twitterCardData: { [key: string]: string } = {};
    
    $('meta').each((_, element) => {
      const name = $(element).attr('name');
      const property = $(element).attr('property');
      const content = $(element).attr('content') || '';
      
      if (name && content) {
        metaTags[name] = content;
        if (name.startsWith('twitter:')) {
          twitterCardData[name] = content;
        }
      }
      
      if (property && content) {
        metaTags[property] = content;
        if (property.startsWith('og:')) {
          openGraphData[property] = content;
        }
      }
    });

    // Extract JSON-LD structured data
    const jsonLdData: any[] = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '');
        jsonLdData.push(jsonData);
      } catch (e) {
        // Ignore invalid JSON
      }
    });

    // === CONTENT STRUCTURE ===
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 2) {
        headings.push(text);
      }
    });

    const paragraphs: string[] = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20) {
        paragraphs.push(text);
      }
    });

    const lists: string[] = [];
    $('ul li, ol li').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 5 && text.length < 300) {
        lists.push(text);
      }
    });

    // === FEATURES & BENEFITS ===
    const features: string[] = [];
    const benefits: string[] = [];
    const testimonials: string[] = [];
    
    const featureSelectors = [
      '.features li', '.feature-list li', '[class*="feature"] li',
      '.benefits li', '.advantages li', '.capabilities li'
    ];

    featureSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 10 && text.length < 200) {
          if (selector.includes('benefit') || selector.includes('advantage')) {
            benefits.push(text);
          } else {
            features.push(text);
          }
        }
      });
    });

    // Extract testimonials
    const testimonialSelectors = [
      '.testimonial', '.review', '.quote', '.customer-quote',
      '[class*="testimonial"]', '[class*="review"]'
    ];

    testimonialSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 20 && text.length < 500) {
          testimonials.push(text);
        }
      });
    });

    // === PRICING ===
    const pricing: string[] = [];
    const pricingSelectors = [
      '[class*="price"]', '[class*="pricing"]', '[class*="cost"]',
      '[id*="price"]', '[id*="pricing"]', '.plan', '.tier'
    ];

    pricingSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const text = $(element).text().trim();
        if (text && (/\$|€|£|₹|USD|EUR|GBP|\d+/.test(text))) {
          pricing.push(text);
        }
      });
    });

    // === MEDIA & ASSETS ===
    const images: Array<{src: string; alt: string; width?: number; height?: number}> = [];
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';
      const width = parseInt($(element).attr('width') || '0') || undefined;
      const height = parseInt($(element).attr('height') || '0') || undefined;
      
      if (src && !src.includes('data:image') && !src.includes('placeholder')) {
        try {
          const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
          images.push({ src: fullUrl, alt, width, height });
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    const videos: string[] = [];
    $('video source, iframe[src*="youtube"], iframe[src*="vimeo"]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        videos.push(src);
      }
    });

    const documents: string[] = [];
    $('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        documents.push(href);
      }
    });

    // Find logo
    let logoUrl: string | null = null;
    const logoSelectors = [
      '.logo img', '#logo img', '[class*="logo"] img',
      'img[alt*="logo"]', 'img[class*="logo"]'
    ];
    
    for (const selector of logoSelectors) {
      const logoElement = $(selector).first();
      if (logoElement.length) {
        const src = logoElement.attr('src');
        if (src) {
          try {
            logoUrl = src.startsWith('http') ? src : new URL(src, url).href;
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
      }
    }

    // Find favicon
    let favicon: string | null = null;
    const faviconElement = $('link[rel="icon"], link[rel="shortcut icon"]').first();
    if (faviconElement.length) {
      const href = faviconElement.attr('href');
      if (href) {
        try {
          favicon = href.startsWith('http') ? href : new URL(href, url).href;
        } catch (e) {
          // Ignore
        }
      }
    }

    // === CONTACT & SOCIAL ===
    const socialLinks: Array<{platform: string; url: string}> = [];
    const socialPlatforms = {
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'facebook.com': 'Facebook',
      'linkedin.com': 'LinkedIn',
      'instagram.com': 'Instagram',
      'youtube.com': 'YouTube',
      'github.com': 'GitHub',
      'discord.com': 'Discord',
      'tiktok.com': 'TikTok',
      'pinterest.com': 'Pinterest'
    };

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        for (const [domain, platform] of Object.entries(socialPlatforms)) {
          if (href.includes(domain)) {
            socialLinks.push({ platform, url: href });
            break;
          }
        }
      }
    });

    // Extract contact information
    const bodyText = $('body').text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    
    const emails = [...new Set(bodyText.match(emailRegex) || [])].slice(0, 5);
    const phones = [...new Set(bodyText.match(phoneRegex) || [])].slice(0, 5);
    
    const contactInfo = { emails, phones, addresses: [] };

    // === TECHNICAL INFORMATION ===
    const technologies: string[] = [];
    
    // Detect common technologies
    const html = response.data;
    if (html.includes('react')) technologies.push('React');
    if (html.includes('vue')) technologies.push('Vue.js');
    if (html.includes('angular')) technologies.push('Angular');
    if (html.includes('next')) technologies.push('Next.js');
    if (html.includes('gatsby')) technologies.push('Gatsby');
    if (html.includes('wordpress')) technologies.push('WordPress');
    if (html.includes('shopify')) technologies.push('Shopify');
    if (html.includes('stripe')) technologies.push('Stripe');
    if (html.includes('paypal')) technologies.push('PayPal');

    const httpsEnabled = url.startsWith('https');
    const mobileOptimized = $('meta[name="viewport"]').length > 0;

    // === CONTENT ANALYSIS ===
    const fullText = $('body').text();
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 WPM average
    
    const keywords = extractKeywords(fullText);
    
    // Simple language detection
    const languageDetected = $('html').attr('lang') || 'en';
    
    // Simple sentiment analysis (basic)
    const sentiment = detectSentiment(fullText);

    // === BUSINESS INFORMATION ===
    const companyInfo = {
      name: title.split(' - ')[0] || title,
      description: description,
    };

    // === NAVIGATION & STRUCTURE ===
    const navigationMenu: string[] = [];
    $('nav a, .nav a, .menu a, header a').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 1 && text.length < 50) {
        navigationMenu.push(text);
      }
    });

    const footerLinks: string[] = [];
    $('footer a').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 1 && text.length < 50) {
        footerLinks.push(text);
      }
    });

    // === E-COMMERCE ===
    const products: any[] = [];
    const categories: string[] = [];
    const paymentMethods: string[] = [];
    
    // Detect payment methods
    if (html.includes('visa')) paymentMethods.push('Visa');
    if (html.includes('mastercard')) paymentMethods.push('Mastercard');
    if (html.includes('paypal')) paymentMethods.push('PayPal');
    if (html.includes('stripe')) paymentMethods.push('Stripe');
    if (html.includes('apple pay')) paymentMethods.push('Apple Pay');
    if (html.includes('google pay')) paymentMethods.push('Google Pay');

    // === ANALYTICS & TRACKING ===
    const analyticsTools: string[] = [];
    const trackingPixels: string[] = [];
    
    if (html.includes('google-analytics') || html.includes('gtag')) analyticsTools.push('Google Analytics');
    if (html.includes('mixpanel')) analyticsTools.push('Mixpanel');
    if (html.includes('amplitude')) analyticsTools.push('Amplitude');
    if (html.includes('hotjar')) analyticsTools.push('Hotjar');
    if (html.includes('intercom')) analyticsTools.push('Intercom');

    // === QUALITY METRICS ===
    let completeness = 0.5; // Base score
    if (title.length > 10) completeness += 0.1;
    if (description.length > 50) completeness += 0.1;
    if (images.length > 0) completeness += 0.1;
    if (socialLinks.length > 0) completeness += 0.1;
    if (contactInfo.emails.length > 0) completeness += 0.1;
    if (features.length > 0) completeness += 0.1;
    
    const seoScore = calculateSEOScore($, {
      title,
      description,
      headings,
      images,
      metaTags
    });

    const scrapeQuality = Math.min(1.0, completeness + (seoScore / 100) * 0.3);

    // === CLEAN AND LIMIT DATA ===
    return {
      // Basic Information
      title,
      description,
      content: fullText.substring(0, 10000),
      url,
      
      // Meta Information
      metaTags,
      openGraphData,
      twitterCardData,
      jsonLdData,
      
      // Content Structure
      headings: [...new Set(headings)].slice(0, 30),
      paragraphs: [...new Set(paragraphs)].slice(0, 20),
      lists: [...new Set(lists)].slice(0, 50),
      
      // Features & Benefits
      features: [...new Set(features)].slice(0, 20),
      benefits: [...new Set(benefits)].slice(0, 15),
      pricing: [...new Set(pricing)].slice(0, 10),
      testimonials: [...new Set(testimonials)].slice(0, 10),
      
      // Media & Assets
      images: images.slice(0, 20),
      videos: [...new Set(videos)].slice(0, 10),
      documents: [...new Set(documents)].slice(0, 10),
      logoUrl,
      favicon,
      
      // Contact & Social
      socialLinks: [...new Set(socialLinks.map(s => JSON.stringify(s)))].map(s => JSON.parse(s)).slice(0, 15),
      contactInfo,
      
      // Technical Information
      technologies: [...new Set(technologies)],
      performanceMetrics: {
        scrapeTime,
        responseTime: response.headers['x-response-time'] ? parseInt(response.headers['x-response-time']) : undefined,
        pageSize: Buffer.byteLength(response.data, 'utf8'),
      },
      seoScore,
      mobileOptimized,
      httpsEnabled,
      
      // Content Analysis
      wordCount,
      readingTime,
      languageDetected,
      keywords: keywords.slice(0, 30),
      sentiment,
      
      // Business Information
      companyInfo,
      businessModel: detectBusinessModel(fullText),
      industryCategory: detectIndustryCategory(fullText, title),
      
      // Navigation & Structure
      navigationMenu: [...new Set(navigationMenu)].slice(0, 20),
      footerLinks: [...new Set(footerLinks)].slice(0, 20),
      internalLinks: [],
      externalLinks: [],
      
      // E-commerce
      products,
      categories: [...new Set(categories)].slice(0, 20),
      paymentMethods: [...new Set(paymentMethods)],
      shippingInfo: null,
      
      // Analytics & Tracking
      analyticsTools: [...new Set(analyticsTools)],
      trackingPixels: [...new Set(trackingPixels)],
      
      // Quality Metrics
      scrapeQuality,
      completeness,
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && word.length < 15)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'].includes(word));

  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

export function detectSentiment(text: string): string {
  const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'love', 'perfect', 'best', 'awesome', 'incredible', 'outstanding', 'brilliant', 'superb', 'exceptional', 'remarkable'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointing', 'poor', 'fail', 'broken', 'useless', 'frustrating', 'annoying', 'difficult'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    positiveCount += matches;
  });
  
  negativeWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    negativeCount += matches;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export function calculateSEOScore($: any, data: {
  title: string;
  description: string;
  headings: string[];
  images: any[];
  metaTags: { [key: string]: string };
}): number {
  let score = 0;
  
  // Title check (max 20 points)
  if (data.title.length > 10 && data.title.length < 60) score += 20;
  else if (data.title.length > 0) score += 10;
  
  // Description check (max 20 points)
  if (data.description.length > 50 && data.description.length < 160) score += 20;
  else if (data.description.length > 0) score += 10;
  
  // Headings structure (max 15 points)
  const h1Count = $('h1').length;
  if (h1Count === 1) score += 10;
  else if (h1Count > 0) score += 5;
  
  if (data.headings.length > 3) score += 5;
  
  // Images with alt text (max 15 points)
  const imagesWithAlt = data.images.filter(img => img.alt && img.alt.trim().length > 0);
  const altTextRatio = data.images.length > 0 ? imagesWithAlt.length / data.images.length : 0;
  score += Math.round(altTextRatio * 15);
  
  // Meta tags (max 20 points)
  if (data.metaTags['robots']) score += 5;
  if (data.metaTags['viewport']) score += 5;
  if (data.metaTags['og:title']) score += 5;
  if (data.metaTags['og:description']) score += 5;
  
  // Basic technical SEO (max 10 points)
  if ($('link[rel="canonical"]').length > 0) score += 5;
  if ($('meta[name="author"]').length > 0) score += 3;
  if ($('script[type="application/ld+json"]').length > 0) score += 2;
  
  return Math.min(100, score);
}

export function detectBusinessModel(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('subscription') || lowerText.includes('monthly') || lowerText.includes('annually')) {
    return 'subscription';
  }
  if (lowerText.includes('freemium') || lowerText.includes('free trial')) {
    return 'freemium';
  }
  if (lowerText.includes('marketplace') || lowerText.includes('commission')) {
    return 'marketplace';
  }
  if (lowerText.includes('advertising') || lowerText.includes('sponsored')) {
    return 'advertising';
  }
  if (lowerText.includes('one-time') || lowerText.includes('purchase')) {
    return 'one-time-purchase';
  }
  if (lowerText.includes('enterprise') || lowerText.includes('custom pricing')) {
    return 'enterprise';
  }
  
  return null;
}

export function detectIndustryCategory(text: string, title: string): string | null {
  const fullText = (text + ' ' + title).toLowerCase();
  
  if (fullText.includes('saas') || fullText.includes('software')) return 'SaaS';
  if (fullText.includes('ecommerce') || fullText.includes('e-commerce') || fullText.includes('store')) return 'E-commerce';
  if (fullText.includes('finance') || fullText.includes('fintech') || fullText.includes('payment')) return 'Finance';
  if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('fitness')) return 'Healthcare';
  if (fullText.includes('education') || fullText.includes('learning') || fullText.includes('course')) return 'Education';
  if (fullText.includes('marketing') || fullText.includes('analytics') || fullText.includes('advertising')) return 'Marketing';
  if (fullText.includes('productivity') || fullText.includes('project management') || fullText.includes('collaboration')) return 'Productivity';
  if (fullText.includes('design') || fullText.includes('creative') || fullText.includes('graphics')) return 'Design';
  if (fullText.includes('developer') || fullText.includes('coding') || fullText.includes('api')) return 'Developer Tools';
  if (fullText.includes('social') || fullText.includes('community') || fullText.includes('networking')) return 'Social';
  if (fullText.includes('game') || fullText.includes('gaming') || fullText.includes('entertainment')) return 'Gaming';
  if (fullText.includes('ai') || fullText.includes('artificial intelligence') || fullText.includes('machine learning')) return 'AI/ML';
  
  return null;
}
