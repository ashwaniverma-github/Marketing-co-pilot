'use client';

import { useState, useEffect } from 'react';

interface AnalysisData {
  analysis: {
    title: string;
    description: string;
    keywords: string[];
    valueProposition: string;
    targetAudience: string;
    features: string[];
  };
  productData: {
    url: string;
    name: string;
    tagline?: string;
  };
}

interface MarketingKit {
  socialPosts: {
    platform: string;
    content: string;
    hashtags: string[];
  }[];
  emailSnippets: {
    subject: string;
    content: string;
    type: string;
  }[];
  growthIdeas: {
    title: string;
    description: string;
    effort: string;
    impact: string;
  }[];
  memes: {
    template: string;
    topText: string;
    bottomText: string;
    description: string;
  }[];
}

export default function GenerateKitPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [marketingKit, setMarketingKit] = useState<MarketingKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load analysis data from localStorage
    const storedData = localStorage.getItem('productAnalysis');
    if (storedData) {
      try {
        setAnalysisData(JSON.parse(storedData));
      } catch (err) {
        setError('Failed to load analysis data');
      }
    } else {
      setError('No analysis data found. Please start over.');
    }
  }, []);

  const generateMarketingKit = async () => {
    if (!analysisData) return;

    setIsGenerating(true);
    setError('');

    try {
      // For now, generate a sample kit based on the analysis
      // TODO: Replace with actual AI generation API call
      
      const kit: MarketingKit = {
        socialPosts: [
          {
            platform: 'Twitter',
            content: `🚀 Introducing ${analysisData.productData.name}! ${analysisData.analysis.valueProposition}\n\n✨ Perfect for ${analysisData.analysis.targetAudience}\n\nCheck it out: ${analysisData.productData.url}`,
            hashtags: ['#startup', '#productivity', '#tool']
          },
          {
            platform: 'LinkedIn',
            content: `Excited to share ${analysisData.productData.name} with the community!\n\n${analysisData.analysis.description}\n\nThis tool is specifically designed for ${analysisData.analysis.targetAudience} who want to streamline their workflow.\n\nKey features:\n${analysisData.analysis.features.slice(0, 3).map(f => `• ${f}`).join('\n')}\n\nLearn more: ${analysisData.productData.url}`,
            hashtags: ['#productivity', '#business', '#innovation']
          },
          {
            platform: 'Reddit',
            content: `Hey r/startups! Just launched ${analysisData.productData.name} - ${analysisData.analysis.valueProposition.toLowerCase()}\n\nBuilt this because I was frustrated with existing solutions. Would love to get your feedback!\n\nLink: ${analysisData.productData.url}`,
            hashtags: []
          }
        ],
        emailSnippets: [
          {
            subject: `Introducing ${analysisData.productData.name} - ${analysisData.analysis.valueProposition}`,
            content: `Hi there!\n\nI'm excited to share something I've been working on: ${analysisData.productData.name}.\n\n${analysisData.analysis.description}\n\nIt's perfect for ${analysisData.analysis.targetAudience} who want to:\n${analysisData.analysis.features.slice(0, 3).map(f => `• ${f}`).join('\n')}\n\nCheck it out here: ${analysisData.productData.url}\n\nWould love your thoughts!\n\nBest,\n[Your name]`,
            type: 'Launch Announcement'
          },
          {
            subject: `Quick update on ${analysisData.productData.name}`,
            content: `Hey!\n\nJust a quick update on ${analysisData.productData.name}.\n\nWe've been getting great feedback from ${analysisData.analysis.targetAudience} who are using it to streamline their workflow.\n\nIf you haven't checked it out yet: ${analysisData.productData.url}\n\nLet me know what you think!\n\n[Your name]`,
            type: 'Update/Follow-up'
          }
        ],
        growthIdeas: [
          {
            title: 'Product Hunt Launch',
            description: `Launch ${analysisData.productData.name} on Product Hunt with a compelling story about solving problems for ${analysisData.analysis.targetAudience}`,
            effort: 'Medium',
            impact: 'High'
          },
          {
            title: 'Community Engagement',
            description: `Engage with ${analysisData.analysis.targetAudience} communities on Reddit, Discord, and Slack groups. Share valuable insights and mention your tool when relevant.`,
            effort: 'Low',
            impact: 'Medium'
          },
          {
            title: 'Content Marketing',
            description: `Write blog posts about challenges that ${analysisData.analysis.targetAudience} face and how ${analysisData.productData.name} solves them.`,
            effort: 'High',
            impact: 'High'
          }
        ],
        memes: [
          {
            template: 'Drake Pointing',
            topText: 'Struggling with complex tools',
            bottomText: `Using ${analysisData.productData.name}`,
            description: `Meme highlighting the simplicity of ${analysisData.productData.name} vs competitors`
          },
          {
            template: 'Distracted Boyfriend',
            topText: 'Me using old solution',
            bottomText: `${analysisData.productData.name}`,
            description: `Humorous take on switching to ${analysisData.productData.name}`
          }
        ]
      };

      setMarketingKit(kit);
    } catch (err) {
      setError('Failed to generate marketing kit. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (error && !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/onboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Start Over
          </a>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-600">Step 2 of 3</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Product Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Here's what we learned about {analysisData?.productData.name}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span className="text-green-600">✓ Product Details</span>
            <span className="text-blue-600">• AI Analysis</span>
            <span>First Kit</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisData && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Product Insights</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Value Proposition</h4>
                  <p className="text-gray-600">{analysisData.analysis.valueProposition}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Target Audience</h4>
                  <p className="text-gray-600 capitalize">{analysisData.analysis.targetAudience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Key Features</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    {analysisData.analysis.features.slice(0, 5).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Marketing Strategy</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Content Angle</h4>
                  <p className="text-gray-600">Focus on simplicity and efficiency for busy {analysisData.analysis.targetAudience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Key Messages</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Save time and increase productivity</li>
                    <li>• Built specifically for {analysisData.analysis.targetAudience}</li>
                    <li>• Easy to use, powerful features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Platform Strategy</h4>
                  <p className="text-gray-600">Twitter for reach, LinkedIn for professionals, Reddit for community feedback</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Kit Section */}
        {!marketingKit ? (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Generate Your Marketing Kit?
              </h3>
              <p className="text-gray-600 mb-6">
                Based on this analysis, we'll create a complete weekly marketing package with posts, memes, emails, and growth tactics.
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={generateMarketingKit}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center mx-auto"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Your Kit...
                  </>
                ) : (
                  'Generate My Marketing Kit'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Marketing Kit Results */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Your Marketing Kit is Ready!</h2>
              <p className="text-xl text-gray-600">Here's your complete weekly marketing package</p>
            </div>

            {/* Social Posts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📱 Social Media Posts</h3>
              <div className="grid gap-6">
                {marketingKit.socialPosts.map((post, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-600">{post.platform}</span>
                      <span className="text-sm text-gray-500">{post.content.length} chars</span>
                    </div>
                    <p className="text-gray-800 mb-2">{post.content}</p>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-blue-600 text-sm">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Snippets */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📧 Email Snippets</h3>
              <div className="grid gap-6">
                {marketingKit.emailSnippets.map((email, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-600">{email.type}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Subject: {email.subject}</h4>
                    <p className="text-gray-800 whitespace-pre-line">{email.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Memes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">😂 Meme Ideas</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {marketingKit.memes.map((meme, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-600 mb-2">{meme.template}</h4>
                    <div className="bg-gray-100 rounded p-3 mb-2 text-center">
                      <p className="text-sm font-medium">"{meme.topText}"</p>
                      <p className="text-xs text-gray-500 my-1">--- IMAGE ---</p>
                      <p className="text-sm font-medium">"{meme.bottomText}"</p>
                    </div>
                    <p className="text-gray-600 text-sm">{meme.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Ideas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Growth Tactics</h3>
              <div className="grid gap-6">
                {marketingKit.growthIdeas.map((idea, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{idea.title}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          idea.effort === 'Low' ? 'bg-green-100 text-green-800' :
                          idea.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {idea.effort} Effort
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          idea.impact === 'High' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {idea.impact} Impact
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">{idea.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
                <p className="text-gray-600 mb-6">
                  Your marketing kit is ready! You can now schedule these posts, send the emails, and start implementing the growth tactics.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                    Schedule Posts
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                    Export Kit
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                    Generate New Kit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
