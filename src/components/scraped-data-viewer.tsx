'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Globe,
  Image,
  Video,
  FileText,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Search,
  Clock,
  Languages,
  Tag,
  Shield,
  Smartphone,
  CreditCard,
  BarChart3,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ScrapedDataViewerProps {
  productId: string;
  productUrl: string;
}

interface ScrapedDataResponse {
  scrapedData: {
    // Basic Information
    title: string;
    description: string;
    content: string;
    url: string;
    
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
    
    // E-commerce
    categories: string[];
    paymentMethods: string[];
    
    // Analytics & Tools
    analyticsTools: string[];
    
    // Quality Metrics
    scrapeQuality: number;
    completeness: number;
    
    // Performance
    performanceMetrics: {
      scrapeTime: number;
      responseTime?: number;
      pageSize?: number;
    };
  };
}

export function ScrapedDataViewer({ productId, productUrl }: ScrapedDataViewerProps) {
  const [scrapedData, setScrapedData] = useState<ScrapedDataResponse['scrapedData'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    loadScrapedData();
  }, [productId]);

  const loadScrapedData = () => {
    // Try to load from localStorage first
    const analysisData = localStorage.getItem(`analysis_${productId}`);
    if (analysisData) {
      try {
        const parsed = JSON.parse(analysisData);
        if (parsed.analysis?.scrapedData) {
          setScrapedData(parsed.analysis.scrapedData);
          setLastUpdated(parsed.app?.createdAt || new Date().toISOString());
        }
      } catch (error) {
        console.error('Error parsing stored analysis data:', error);
      }
    }
  };

  const refreshScrapedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl,
          productName: scrapedData?.title || 'Product',
          forceRefresh: true
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to refresh scraped data');
      }

      if (result.data?.analysis?.scrapedData) {
        setScrapedData(result.data.analysis.scrapedData);
        setLastUpdated(new Date().toISOString());
        localStorage.setItem(`analysis_${productId}`, JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('Failed to refresh scraped data:', error);
      alert('Failed to refresh scraped data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    sectionKey: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div className="bg-card rounded-xl border">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 border-t">
            {content}
          </div>
        )}
      </div>
    );
  };

  if (!scrapedData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border p-8 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Scraped Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Scraped website data will appear here after analyzing the product.
          </p>
          <Button onClick={refreshScrapedData} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping Website...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Scrape Website Data
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Website Analysis</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Unknown'}</span>
              <div className="flex items-center space-x-2">
                <span>Quality Score:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getQualityColor(scrapedData.scrapeQuality)}`}>
                  {Math.round(scrapedData.scrapeQuality * 100)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Completeness:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getQualityColor(scrapedData.completeness)}`}>
                  {Math.round(scrapedData.completeness * 100)}%
                </span>
              </div>
            </div>
          </div>
          <Button onClick={refreshScrapedData} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      {renderSection(
        'Website Overview',
        <Globe className="w-5 h-5 text-blue-600" />,
        'overview',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Title:</span> {scrapedData.title}</div>
                <div><span className="font-medium">Description:</span> {scrapedData.description}</div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">URL:</span>
                  <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {scrapedData.url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Technical Info</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.httpsEnabled && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    HTTPS
                  </span>
                )}
                {scrapedData.mobileOptimized && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs flex items-center">
                    <Smartphone className="w-3 h-3 mr-1" />
                    Mobile Optimized
                  </span>
                )}
                <span className={`px-2 py-1 rounded-md text-xs flex items-center ${getSentimentColor(scrapedData.sentiment)}`}>
                  Sentiment: {scrapedData.sentiment}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Content Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>{scrapedData.wordCount.toLocaleString()} words</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{scrapedData.readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-gray-600" />
                  <span>{scrapedData.languageDetected}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span>SEO: {scrapedData.seoScore}/100</span>
                </div>
              </div>
            </div>

            {scrapedData.businessModel && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Business Info</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Model:</span> {scrapedData.businessModel}</div>
                  {scrapedData.industryCategory && (
                    <div><span className="font-medium">Industry:</span> {scrapedData.industryCategory}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features & Content */}
      {(scrapedData.features.length > 0 || scrapedData.benefits.length > 0) && renderSection(
        'Features & Benefits',
        <Star className="w-5 h-5 text-yellow-600" />,
        'features',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrapedData.features.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Features ({scrapedData.features.length})
              </h4>
              <div className="space-y-2">
                {scrapedData.features.slice(0, 10).map((feature, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    {feature}
                  </div>
                ))}
                {scrapedData.features.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    +{scrapedData.features.length - 10} more features
                  </p>
                )}
              </div>
            </div>
          )}

          {scrapedData.benefits.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Benefits ({scrapedData.benefits.length})
              </h4>
              <div className="space-y-2">
                {scrapedData.benefits.slice(0, 10).map((benefit, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    {benefit}
                  </div>
                ))}
                {scrapedData.benefits.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    +{scrapedData.benefits.length - 10} more benefits
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media & Assets */}
      {(scrapedData.images.length > 0 || scrapedData.videos.length > 0) && renderSection(
        'Media & Assets',
        <Image className="w-5 h-5 text-purple-600" />,
        'media',
        <div className="space-y-6">
          {scrapedData.images.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Images ({scrapedData.images.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scrapedData.images.slice(0, 8).map((image, index) => (
                  <div key={index} className="group relative">
                    <img 
                      src={image.src} 
                      alt={image.alt || `Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => window.open(image.src, '_blank')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {scrapedData.images.length > 8 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{scrapedData.images.length - 8} more images
                </p>
              )}
            </div>
          )}

          {scrapedData.videos.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Videos ({scrapedData.videos.length})
              </h4>
              <div className="space-y-2">
                {scrapedData.videos.map((video, index) => (
                  <a
                    key={index}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="text-sm truncate">{video}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact & Social */}
      {(scrapedData.socialLinks.length > 0 || scrapedData.contactInfo.emails.length > 0) && renderSection(
        'Contact & Social',
        <Users className="w-5 h-5 text-green-600" />,
        'contact',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrapedData.socialLinks.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Social Media ({scrapedData.socialLinks.length})
              </h4>
              <div className="space-y-2">
                {scrapedData.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium text-sm">{link.platform}</span>
                    <span className="text-sm text-muted-foreground truncate">{link.url}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-foreground mb-3">Contact Information</h4>
            <div className="space-y-3">
              {scrapedData.contactInfo.emails.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium flex items-center mb-2">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </h5>
                  {scrapedData.contactInfo.emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => copyToClipboard(email)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {scrapedData.contactInfo.phones.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium flex items-center mb-2">
                    <Phone className="w-3 h-3 mr-1" />
                    Phone
                  </h5>
                  {scrapedData.contactInfo.phones.map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm">{phone}</span>
                      <button
                        onClick={() => copyToClipboard(phone)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEO & Keywords */}
      {scrapedData.keywords.length > 0 && renderSection(
        'SEO & Keywords',
        <Search className="w-5 h-5 text-indigo-600" />,
        'seo',
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{scrapedData.seoScore}</div>
              <div className="text-sm text-muted-foreground">SEO Score</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{scrapedData.keywords.length}</div>
              <div className="text-sm text-muted-foreground">Keywords</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{scrapedData.headings.length}</div>
              <div className="text-sm text-muted-foreground">Headings</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Top Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {scrapedData.keywords.slice(0, 20).map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-muted text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technology Stack */}
      {(scrapedData.technologies.length > 0 || scrapedData.analyticsTools.length > 0) && renderSection(
        'Technology & Analytics',
        <BarChart3 className="w-5 h-5 text-orange-600" />,
        'technology',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrapedData.technologies.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Technologies Detected</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {scrapedData.analyticsTools.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Analytics Tools</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.analyticsTools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* E-commerce Info */}
      {(scrapedData.paymentMethods.length > 0 || scrapedData.categories.length > 0) && renderSection(
        'E-commerce',
        <CreditCard className="w-5 h-5 text-pink-600" />,
        'ecommerce',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrapedData.paymentMethods.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Methods
              </h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.paymentMethods.map((method, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-sm rounded-full"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {scrapedData.categories.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Product Categories</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedData.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {renderSection(
        'Performance Metrics',
        <BarChart3 className="w-5 h-5 text-red-600" />,
        'performance',
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-lg font-semibold text-foreground">
              {scrapedData.performanceMetrics.scrapeTime}ms
            </div>
            <div className="text-sm text-muted-foreground">Scrape Time</div>
          </div>
          
          {scrapedData.performanceMetrics.pageSize && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-lg font-semibold text-foreground">
                {Math.round(scrapedData.performanceMetrics.pageSize / 1024)}KB
              </div>
              <div className="text-sm text-muted-foreground">Page Size</div>
            </div>
          )}
          
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className={`text-lg font-semibold ${getQualityColor(scrapedData.scrapeQuality).split(' ')[0]}`}>
              {Math.round(scrapedData.scrapeQuality * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Quality Score</div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className={`text-lg font-semibold ${getQualityColor(scrapedData.completeness).split(' ')[0]}`}>
              {Math.round(scrapedData.completeness * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completeness</div>
          </div>
        </div>
      )}
    </div>
  );
}
