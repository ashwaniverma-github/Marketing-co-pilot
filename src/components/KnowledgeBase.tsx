'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from 'sonner';

interface ScrapedProductData {
  id: string;
  name: string;
  title: string;
  description?: string;
  url: string;
  features?: string[];
  benefits?: string[];
  technologies?: string[];
  keywords?: string[];
  businessModel?: string;
  industryCategory?: string;
  companyInfo?: any;
  socialLinks?: any;
  contactInfo?: any;
  performanceMetrics?: any;
  seoScore?: number;
  mobileOptimized?: boolean;
  lastScrapedAt?: string;
  pricing?: string[]; // Add pricing field
  paymentMethods?: string[]; // Add payment methods
}

export default function KnowledgeBase({ productId }: { productId: string }) {
  const [scrapedData, setScrapedData] = useState<ScrapedProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ScrapedProductData>>({});

  const fetchProductKnowledge = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/knowledge`);
      if (!response.ok) {
        throw new Error('Failed to fetch product knowledge');
      }
      const data = await response.json();
      setScrapedData(data);
      setIsLoading(false);
      setError(null);
      
      // Reset editing state when new product data is fetched
      setIsEditing(false);
      setEditedData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
      setScrapedData(null);
      
      // Reset editing state on error
      setIsEditing(false);
      setEditedData({});
    }
  };

  // Initial fetch and re-fetch when productId changes
  useEffect(() => {
    if (productId) {
      fetchProductKnowledge();
    }
  }, [productId]);

  const handleEdit = () => {
    // Initialize editing with current data
    setEditedData({
      title: scrapedData?.title || '',
      description: scrapedData?.description || '',
      features: scrapedData?.features || [],
      benefits: scrapedData?.benefits || [],
      technologies: scrapedData?.technologies || [],
      keywords: scrapedData?.keywords || [],
      businessModel: scrapedData?.businessModel || '',
      industryCategory: scrapedData?.industryCategory || '',
      pricing: scrapedData?.pricing || [],
      paymentMethods: scrapedData?.paymentMethods || [],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/knowledge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save product knowledge');
      }

      const updatedData = await response.json();
      setScrapedData(updatedData);
      setIsEditing(false);
      toast.success('Product knowledge updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleInputChange = (
    field: keyof ScrapedProductData, 
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditedData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleArrayChange = (
    field: 'features' | 'benefits' | 'technologies' | 'keywords' | 'pricing' | 'paymentMethods', 
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    
    // Use a more sophisticated parsing method
    const arrayValue = value
      // First, split by newline to support multi-line input
      .split('\n')
      // Then trim each line and filter out empty lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // If a line contains a comma, keep it intact
      .map(line => line.replace(/,\s*/g, '|COMMA|'));
    
    setEditedData(prev => ({
      ...prev,
      [field]: arrayValue.map(item => item.replace(/\|COMMA\|/g, ', '))
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!scrapedData) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No product information available.
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className=" relative h-[calc(100vh-7rem)] overflow-y-auto space-y-6 p-6 bg-background sm:w-10/10 w-11/12 mx-auto px-10 ">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{scrapedData.name} Knowledge Base</h2>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>Edit Knowledge</Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Title</label>
                    <Input 
                      className='focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-200 
                        placeholder-gray-500 dark:placeholder-gray-400
                        rounded-lg shadow-sm 
                        transition-all duration-300 ease-in-out
                        hover:border-cyan-950'
                      value={editedData.title || ''} 
                      onChange={(e) => handleInputChange('title', e)}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">URL</label>
                    <Input 
                      className='cursor-not-allowed opacity-70 
                        bg-gray-100 dark:bg-gray-700 
                        text-gray-600 dark:text-gray-400
                        rounded-lg shadow-sm'
                      value={scrapedData.url} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Description</label>
                    <Textarea 
                      className='focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-200 
                        placeholder-gray-500 dark:placeholder-gray-400
                        rounded-lg shadow-sm 
                        transition-all duration-300 ease-in-out
                        hover:border-cyan-950'
                      value={editedData.description || ''} 
                      onChange={(e) => handleInputChange('description', e)}
                    />
                  </div>
                </div>
              </div>

              {/* Features Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Features</h3>
                <div>
                  <label className="block mb-2">Features (comma-separated)</label>
                  <Textarea 
                  className='focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-200 
                    placeholder-gray-500 dark:placeholder-gray-400
                    rounded-lg shadow-sm 
                    transition-all duration-300 ease-in-out
                    hover:border-cyan-950'
                    value={editedData.features?.join('\n') || ''} 
                    onChange={(e) => handleArrayChange('features', e)}
                    placeholder="Enter features (one per line)
Example:
AI-powered analysis
Real-time collaboration
Customizable dashboards"
                    rows={5}
                  />
                </div>
              </div>

              {/* Technologies Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Technologies</h3>
                <div>
                  <label className="block mb-2">Technologies (comma-separated)</label>
                  <Textarea 
                    className='border-indigo-600 focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-200 
                      placeholder-gray-500 dark:placeholder-gray-400
                      rounded-lg shadow-sm 
                      transition-all duration-300 ease-in-out
                      hover:border-cyan-950'
                    value={editedData.technologies?.join('\n') || ''} 
                    onChange={(e) => handleArrayChange('technologies', e)}
                    placeholder="Enter technologies (one per line)
Example:
React
Node.js
PostgreSQL
Docker"
                    rows={5}
                  />
                </div>
              </div>

              {/* Business Information Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Business Insights</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Business Model</label>
                    <Input 
                      className='focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-200 
                        placeholder-gray-500 dark:placeholder-gray-400
                        rounded-lg shadow-sm 
                        transition-all duration-300 ease-in-out
                        hover:border-cyan-950'
                      value={editedData.businessModel || ''} 
                      onChange={(e) => handleInputChange('businessModel', e)}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Industry Category</label>
                    <Input 
                      className='focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-200 
                        placeholder-gray-500 dark:placeholder-gray-400
                        rounded-lg shadow-sm 
                        transition-all duration-300 ease-in-out
                        hover:border-cyan-950'
                      value={editedData.industryCategory || ''} 
                      onChange={(e) => handleInputChange('industryCategory', e)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Editing */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {/* Keywords Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Keywords</h3>
                <Textarea 
                  className='border-indigo-600 focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-200 
                    placeholder-gray-500 dark:placeholder-gray-400
                    rounded-lg shadow-sm 
                    transition-all duration-300 ease-in-out
                    hover:border-cyan-950'
                  value={editedData.keywords?.join('\n') || ''} 
                  onChange={(e) => handleArrayChange('keywords', e)}
                  placeholder="Enter keywords (one per line)
Example:
productivity
AI
analytics
collaboration"
                  rows={5}
                />
              </div>

              {/* Benefits Editing */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Benefits</h3>
                <Textarea 
                  className='border-indigo-600 focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-200 
                    placeholder-gray-500 dark:placeholder-gray-400
                    rounded-lg shadow-sm 
                    transition-all duration-300 ease-in-out
                    hover:border-cyan-950'
                  value={editedData.benefits?.join('\n') || ''} 
                  onChange={(e) => handleArrayChange('benefits', e)}
                  placeholder="Enter benefits (one per line)
Example:
Increase team productivity
Reduce manual work
Improve decision-making
Streamline workflows"
                  rows={5}
                />
              </div>
            </div>

            {/* Pricing Information Editing */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Pricing</h3>
                <Textarea 
                  className='border-indigo-600 focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-200 
                    placeholder-gray-500 dark:placeholder-gray-400
                    rounded-lg shadow-sm 
                    transition-all duration-300 ease-in-out
                    hover:border-cyan-950'
                  value={editedData.pricing?.join('\n') || ''} 
                  onChange={(e) => handleArrayChange('pricing', e)}
                  placeholder="Enter pricing details (one per line)
Example:
Basic Plan: $9.99/month
Pro Plan: $19.99/month with advanced features"
                  rows={5}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Payment Methods</h3>
                <Textarea 
                  className='border-indigo-600 focus:ring-2 focus:ring-cyan-900 focus:border-cyan-900 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-200 
                    placeholder-gray-500 dark:placeholder-gray-400
                    rounded-lg shadow-sm 
                    transition-all duration-300 ease-in-out
                    hover:border-cyan-950'
                  value={editedData.paymentMethods?.join('\n') || ''} 
                  onChange={(e) => handleArrayChange('paymentMethods', e)}
                  placeholder="Enter payment methods (one per line)
Example:
Credit Card
PayPal
Apple Pay
Google Pay"
                  rows={5}
                />
              </div>
            </div>
          </div>
        ) : (
          // Existing read-only view remains the same as before
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Basic Details</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Title:</strong> {scrapedData.title || 'N/A'}</p>
                  <p><strong>URL:</strong> <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{scrapedData.url}</a></p>
                  <p><strong>Description:</strong> {scrapedData.description || 'No description available'}</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Features</h3>
                <ul className="bg-muted/50 p-4 rounded-lg list-disc list-inside">
                  {scrapedData.features?.length ? (
                    scrapedData.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No features found</li>
                  )}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Technologies</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  {scrapedData.technologies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {scrapedData.technologies.map((tech, index) => (
                        <span key={index} className="bg-foreground/10 px-2 py-1 rounded-md text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No technologies listed</p>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Business Insights</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Business Model:</strong> {scrapedData.businessModel || 'N/A'}</p>
                  <p><strong>Industry Category:</strong> {scrapedData.industryCategory || 'N/A'}</p>
                  <p><strong>SEO Score:</strong> {scrapedData.seoScore ? `${scrapedData.seoScore.toFixed(2)}/10` : 'N/A'}</p>
                  <p><strong>Mobile Optimized:</strong> {scrapedData.mobileOptimized ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(scrapedData.keywords?.length || scrapedData.benefits?.length) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Additional Information</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  {scrapedData.keywords?.length && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.keywords.map((keyword, index) => (
                          <span key={index} className="bg-foreground/10 px-2 py-1 rounded-md text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scrapedData.benefits?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="list-disc list-inside">
                        {scrapedData.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Information */}
            {(scrapedData.pricing?.length || scrapedData.paymentMethods?.length) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Pricing & Payment</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  {scrapedData.pricing?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Pricing Details</h4>
                      <ul className="list-disc list-inside">
                        {scrapedData.pricing.map((price, index) => (
                          <li key={index} className="text-foreground">{price}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scrapedData.paymentMethods?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Payment Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.paymentMethods.map((method, index) => (
                          <span 
                            key={index} 
                            className="bg-foreground/10 px-2 py-1 rounded-md text-sm text-foreground"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}