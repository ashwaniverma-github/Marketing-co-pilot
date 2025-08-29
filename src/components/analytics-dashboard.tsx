'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  Twitter,
  Linkedin,
  Globe,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PostAnalytics {
  id: string;
  postId: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  publishedAt: Date;
  content: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    engagement_rate: number;
  };
  reach: number;
  impressions: number;
}

interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  topPerformingPost: PostAnalytics | null;
  platformBreakdown: {
    platform: string;
    posts: number;
    engagement: number;
  }[];
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate analytics data loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock analytics data
      const mockAnalytics: PostAnalytics[] = [
        {
          id: '1',
          postId: 'post_1',
          platform: 'twitter',
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          content: 'Check out our new feature! 🚀 #productivity #saas',
          metrics: {
            views: 1250,
            likes: 89,
            comments: 15,
            shares: 23,
            clicks: 45,
            engagement_rate: 10.2
          },
          reach: 1100,
          impressions: 1250
        },
        {
          id: '2',
          postId: 'post_2',
          platform: 'linkedin',
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          content: 'Lessons learned building a SaaS product...',
          metrics: {
            views: 2340,
            likes: 156,
            comments: 34,
            shares: 12,
            clicks: 89,
            engagement_rate: 8.6
          },
          reach: 2100,
          impressions: 2340
        },
        {
          id: '3',
          postId: 'post_3',
          platform: 'twitter',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          content: 'Pro tip: Always validate your ideas early! 💡',
          metrics: {
            views: 890,
            likes: 67,
            comments: 8,
            shares: 15,
            clicks: 23,
            engagement_rate: 12.7
          },
          reach: 820,
          impressions: 890
        }
      ];

      setAnalytics(mockAnalytics);

      // Calculate summary
      const totalViews = mockAnalytics.reduce((sum, post) => sum + post.metrics.views, 0);
      const totalLikes = mockAnalytics.reduce((sum, post) => sum + post.metrics.likes, 0);
      const totalComments = mockAnalytics.reduce((sum, post) => sum + post.metrics.comments, 0);
      const totalShares = mockAnalytics.reduce((sum, post) => sum + post.metrics.shares, 0);
      const avgEngagementRate = mockAnalytics.reduce((sum, post) => sum + post.metrics.engagement_rate, 0) / mockAnalytics.length;

      const platformBreakdown = [
        {
          platform: 'Twitter',
          posts: mockAnalytics.filter(p => p.platform === 'twitter').length,
          engagement: mockAnalytics.filter(p => p.platform === 'twitter').reduce((sum, p) => sum + p.metrics.engagement_rate, 0) / mockAnalytics.filter(p => p.platform === 'twitter').length || 0
        },
        {
          platform: 'LinkedIn',
          posts: mockAnalytics.filter(p => p.platform === 'linkedin').length,
          engagement: mockAnalytics.filter(p => p.platform === 'linkedin').reduce((sum, p) => sum + p.metrics.engagement_rate, 0) / mockAnalytics.filter(p => p.platform === 'linkedin').length || 0
        }
      ];

      setSummary({
        totalPosts: mockAnalytics.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate,
        topPerformingPost: mockAnalytics.sort((a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate)[0],
        platformBreakdown
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'reddit':
        return <Globe className="w-4 h-4 text-orange-500" />;
      default:
        return <Twitter className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h3>
          <p className="text-muted-foreground mt-1">Track your content performance and engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {timeRange === '7d' && 'Last 7 days'}
                {timeRange === '30d' && 'Last 30 days'}
                {timeRange === '90d' && 'Last 90 days'}
                {timeRange === 'all' && 'All time'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange('7d')}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('30d')}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('90d')}>
                Last 90 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('all')}>
                All time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(summary.totalViews)}</p>
              <p className="text-muted-foreground text-sm mt-1">Total Views</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/50 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(summary.totalLikes)}</p>
              <p className="text-muted-foreground text-sm mt-1">Total Likes</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(summary.totalComments)}</p>
              <p className="text-muted-foreground text-sm mt-1">Total Comments</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
                <Share className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-green-600">
                {summary.avgEngagementRate.toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(summary.totalShares)}</p>
              <p className="text-muted-foreground text-sm mt-1">Total Shares</p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Performance */}
      {summary && summary.platformBreakdown.length > 0 && (
        <div className="bg-card rounded-2xl border p-6">
          <h4 className="text-lg font-semibold text-foreground mb-6">Platform Performance</h4>
          <div className="grid md:grid-cols-2 gap-6">
            {summary.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(platform.platform.toLowerCase())}
                  <div>
                    <p className="font-medium text-foreground">{platform.platform}</p>
                    <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{platform.engagement.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Post */}
      {summary?.topPerformingPost && (
        <div className="bg-card rounded-2xl border p-6">
          <h4 className="text-lg font-semibold text-foreground mb-6">Top Performing Post</h4>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getPlatformIcon(summary.topPerformingPost.platform)}
                <div className="flex-1">
                  <p className="text-foreground">{summary.topPerformingPost.content}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {summary.topPerformingPost.publishedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {summary.topPerformingPost.metrics.engagement_rate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {formatNumber(summary.topPerformingPost.metrics.views)}
                </p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {formatNumber(summary.topPerformingPost.metrics.likes)}
                </p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {formatNumber(summary.topPerformingPost.metrics.comments)}
                </p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {formatNumber(summary.topPerformingPost.metrics.shares)}
                </p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Performance */}
      <div className="bg-card rounded-2xl border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-foreground">Recent Posts Performance</h4>
        </div>
        <div className="p-6">
          {analytics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No analytics data</h3>
              <p className="text-muted-foreground">
                Publish some posts to see analytics data here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-start space-x-3 flex-1">
                    {getPlatformIcon(post.platform)}
                    <div className="flex-1">
                      <p className="text-foreground line-clamp-2">{post.content}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.publishedAt.toLocaleDateString()} • {post.publishedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{formatNumber(post.metrics.views)}</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{formatNumber(post.metrics.likes)}</p>
                      <p className="text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{post.metrics.engagement_rate.toFixed(1)}%</p>
                      <p className="text-muted-foreground">Engagement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
