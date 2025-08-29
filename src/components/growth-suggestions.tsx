'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Lightbulb,
  Search,
  TrendingUp,
  Target,
  Globe,
  Smartphone,
  Users,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  BarChart3
} from 'lucide-react';

interface GrowthIdea {
  id: string;
  title: string;
  description: string;
  category: 'SEO' | 'Landing Page' | 'User Experience' | 'Content Marketing' | 'Social Media' | 'Analytics';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  priority: number;
  status: 'suggestion' | 'in_progress' | 'completed';
  actionItems: string[];
  estimatedROI?: string;
}

interface SEOAnalysis {
  score: number;
  issues: {
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    fix: string;
  }[];
  recommendations: string[];
}

export function GrowthSuggestions() {
  const [growthIdeas, setGrowthIdeas] = useState<GrowthIdea[]>([]);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    loadGrowthSuggestions();
  }, []);

  const loadGrowthSuggestions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate growth suggestions
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockGrowthIdeas: GrowthIdea[] = [
        {
          id: '1',
          title: 'Optimize Page Loading Speed',
          description: 'Improve website performance by optimizing images, minifying CSS/JS, and implementing lazy loading.',
          category: 'SEO',
          effort: 'Medium',
          impact: 'High',
          priority: 9,
          status: 'suggestion',
          actionItems: [
            'Compress and optimize all images',
            'Minify CSS and JavaScript files',
            'Implement lazy loading for images',
            'Use a Content Delivery Network (CDN)',
            'Enable browser caching'
          ],
          estimatedROI: '15-25% increase in conversions'
        },
        {
          id: '2',
          title: 'Add Social Proof Elements',
          description: 'Include customer testimonials, reviews, and trust badges to build credibility and increase conversions.',
          category: 'Landing Page',
          effort: 'Low',
          impact: 'High',
          priority: 8,
          status: 'suggestion',
          actionItems: [
            'Add customer testimonials section',
            'Display customer logos/brands',
            'Include review ratings and quotes',
            'Add security badges and certifications',
            'Show usage statistics or user count'
          ],
          estimatedROI: '10-20% increase in conversions'
        },
        {
          id: '3',
          title: 'Implement Schema Markup',
          description: 'Add structured data to help search engines understand your content better and improve visibility.',
          category: 'SEO',
          effort: 'Medium',
          impact: 'Medium',
          priority: 7,
          status: 'suggestion',
          actionItems: [
            'Add Organization schema',
            'Implement Product schema for features',
            'Add FAQ schema for support content',
            'Include Review schema for testimonials',
            'Test markup with Google Rich Results Tool'
          ],
          estimatedROI: '5-15% increase in organic traffic'
        },
        {
          id: '4',
          title: 'Optimize Call-to-Action Buttons',
          description: 'Improve CTA design, placement, and copy to increase click-through rates and conversions.',
          category: 'Landing Page',
          effort: 'Low',
          impact: 'Medium',
          priority: 6,
          status: 'suggestion',
          actionItems: [
            'Test different CTA button colors',
            'Optimize button placement and size',
            'A/B test CTA copy variations',
            'Add urgency or scarcity elements',
            'Ensure mobile responsiveness'
          ],
          estimatedROI: '8-18% increase in conversions'
        },
        {
          id: '5',
          title: 'Create Long-form Content',
          description: 'Develop comprehensive guides and tutorials to target long-tail keywords and establish authority.',
          category: 'Content Marketing',
          effort: 'High',
          impact: 'High',
          priority: 8,
          status: 'suggestion',
          actionItems: [
            'Research high-value keywords',
            'Create detailed how-to guides',
            'Write case studies and success stories',
            'Develop video tutorials',
            'Optimize content for featured snippets'
          ],
          estimatedROI: '20-40% increase in organic traffic'
        },
        {
          id: '6',
          title: 'Mobile Experience Optimization',
          description: 'Enhance mobile user experience with responsive design and mobile-specific features.',
          category: 'User Experience',
          effort: 'Medium',
          impact: 'High',
          priority: 8,
          status: 'suggestion',
          actionItems: [
            'Audit mobile page speed',
            'Optimize touch targets and buttons',
            'Simplify mobile navigation',
            'Test on various device sizes',
            'Implement mobile-first design principles'
          ],
          estimatedROI: '12-25% increase in mobile conversions'
        }
      ];

      setGrowthIdeas(mockGrowthIdeas);

      // Mock SEO analysis
      const mockSEOAnalysis: SEOAnalysis = {
        score: 78,
        issues: [
          {
            type: 'critical',
            title: 'Missing Meta Descriptions',
            description: 'Several pages are missing meta descriptions',
            fix: 'Add unique meta descriptions to all pages (150-160 characters)'
          },
          {
            type: 'warning',
            title: 'Large Image Sizes',
            description: 'Some images are not optimized for web',
            fix: 'Compress images and use WebP format when possible'
          },
          {
            type: 'info',
            title: 'Internal Linking',
            description: 'Could benefit from more internal links',
            fix: 'Add relevant internal links to improve page authority'
          }
        ],
        recommendations: [
          'Focus on page speed optimization',
          'Improve mobile responsiveness',
          'Create more quality content',
          'Build high-quality backlinks'
        ]
      };

      setSeoAnalysis(mockSEOAnalysis);

    } catch (error) {
      console.error('Failed to load growth suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIdeaStatus = (ideaId: string, status: GrowthIdea['status']) => {
    setGrowthIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === ideaId ? { ...idea, status } : idea
      )
    );
  };

  const filteredIdeas = activeCategory === 'All' 
    ? growthIdeas 
    : growthIdeas.filter(idea => idea.category === activeCategory);

  const categories = ['All', 'SEO', 'Landing Page', 'User Experience', 'Content Marketing', 'Social Media', 'Analytics'];

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low':
        return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300';
      case 'High':
        return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300';
      case 'Medium':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300';
      case 'Low':
        return 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SEO':
        return <Search className="w-4 h-4" />;
      case 'Landing Page':
        return <Globe className="w-4 h-4" />;
      case 'User Experience':
        return <Smartphone className="w-4 h-4" />;
      case 'Content Marketing':
        return <TrendingUp className="w-4 h-4" />;
      case 'Social Media':
        return <Users className="w-4 h-4" />;
      case 'Analytics':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Growth Suggestions</h3>
          <p className="text-muted-foreground mt-1">AI-powered recommendations to grow your product</p>
        </div>
        <Button onClick={loadGrowthSuggestions} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyzing...' : 'Refresh Suggestions'}
        </Button>
      </div>

      {/* SEO Analysis */}
      {seoAnalysis && (
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-foreground">SEO Health Score</h4>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{seoAnalysis.score}/100</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/30"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${seoAnalysis.score}, 100`}
                    className={`${
                      seoAnalysis.score >= 80 ? 'text-green-500' :
                      seoAnalysis.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-foreground mb-3">Issues Found</h5>
              <div className="space-y-3">
                {seoAnalysis.issues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                    {issue.type === 'critical' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                    {issue.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                    {issue.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{issue.title}</p>
                      <p className="text-muted-foreground text-xs mt-1">{issue.description}</p>
                      <p className="text-primary text-xs mt-1">{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-foreground mb-3">Key Recommendations</h5>
              <div className="space-y-2">
                {seoAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Growth Ideas */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Generating growth suggestions...</span>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No suggestions found</h3>
            <p className="text-muted-foreground">Try selecting a different category or refresh suggestions.</p>
          </div>
        ) : (
          filteredIdeas
            .sort((a, b) => b.priority - a.priority)
            .map((idea) => (
              <div key={idea.id} className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {getCategoryIcon(idea.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-foreground">{idea.title}</h4>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.ceil(idea.priority / 3) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{idea.description}</p>
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getEffortColor(idea.effort)}`}>
                          {idea.effort} Effort
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getImpactColor(idea.impact)}`}>
                          {idea.impact} Impact
                        </span>
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                          {idea.category}
                        </span>
                        {idea.estimatedROI && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300">
                            {idea.estimatedROI}
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="font-medium text-foreground mb-2">Action Items:</h5>
                        <ul className="space-y-1">
                          {idea.actionItems.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm">
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <select
                      value={idea.status}
                      onChange={(e) => updateIdeaStatus(idea.id, e.target.value as GrowthIdea['status'])}
                      className="px-3 py-1 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="suggestion">Suggestion</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Start Task
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
