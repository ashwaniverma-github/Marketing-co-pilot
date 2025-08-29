'use client';

import { useState } from 'react';

export default function OnboardPage() {
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [tagline, setTagline] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!productUrl) {
      newErrors.productUrl = 'Product URL is required';
    } else if (!validateUrl(productUrl)) {
      newErrors.productUrl = 'Please enter a valid URL';
    }

    if (!productName) {
      newErrors.productName = 'Product name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl,
          productName,
          tagline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('Analysis complete:', data);
      
      // Store analysis result in localStorage for now
      localStorage.setItem('productAnalysis', JSON.stringify(data));
      
      // Redirect to kit generation
      window.location.href = '/generate-kit';
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze product. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="font-semibold text-gray-900">Marketing Co-Pilot</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Step 1 of 3</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Get Your Product Ready
          </h1>
          <p className="text-xl text-gray-600">
            Tell us about your product so we can create amazing marketing content for you.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Product Details</span>
            <span>AI Analysis</span>
            <span>First Kit</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Product URL */}
            <div>
              <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Product URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="productUrl"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://your-product.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.productUrl ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.productUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.productUrl}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                We'll analyze your landing page to understand your product automatically.
              </p>
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., MyAwesome App"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.productName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.productName && (
                <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
              )}
            </div>

            {/* Tagline */}
            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                Tagline <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., The easiest way to manage your tasks"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Help us understand your value proposition better.
              </p>
            </div>

            {/* Logo Upload (Future) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo <span className="text-gray-400">(Coming Soon)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>We'll extract your logo from your website automatically</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Your Product...
                </>
              ) : (
                'Analyze My Product'
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              This will take 30-60 seconds. We're reading your website and understanding your product.
            </p>
          </div>
        </form>

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Deep Analysis</h3>
            <p className="text-gray-600 text-sm">
              We'll understand your value prop, features, and target audience
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">
              Get your first marketing kit generated in under 2 minutes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tailored Content</h3>
            <p className="text-gray-600 text-sm">
              Every piece of content will be specifically crafted for your product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
