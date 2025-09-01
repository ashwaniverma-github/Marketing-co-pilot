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
  Linkedin,
  Globe,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { TwitterIcon } from '@/components/icons';
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
      // 1) Sync latest metrics from X before reading analytics (best-effort)
      try {
        await fetch('/api/analytics/sync', { credentials: 'include' });
      } catch {}

      // 2) Load analytics for the selected range
      const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === 'all' ? 365 : 30;
      const res = await fetch(`/api/analytics?days=${days}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to load analytics');
      }

      const ts: any[] = json.analytics?.data || [];
      const top: any[] = json.analytics?.topPosts || [];
      const sum = json.analytics?.summary || {};
      const pbd = json.analytics?.platformBreakdown || [];

      // Map top posts to recent posts performance
      const recent: PostAnalytics[] = top.map((p: any) => ({
        id: p.id,
        postId: p.id,
        platform: (p.platform || 'twitter') as 'twitter' | 'linkedin' | 'reddit',
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        content: p.content,
        metrics: {
          views: p.views || 0,
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          clicks: p.clicks || 0,
          engagement_rate: typeof p.engagementRate === 'number' ? p.engagementRate : 0,
        },
        reach: p.views || 0,
        impressions: p.views || 0,
      }));

      setAnalytics(recent);

      // Derive platform breakdown
      const countsByPlatform: Record<string, number> = {};
      for (const row of ts) {
        const plat = (row.platform || 'twitter') as string;
        countsByPlatform[plat] = (countsByPlatform[plat] || 0) + 1;
      }
      const platformBreakdown = pbd.map((item: any) => ({
        platform: (item.platform || 'twitter') as string,
        posts: countsByPlatform[item.platform] || 0,
        engagement: item.avgEngagementRate || 0,
      }));

      setSummary({
        totalPosts: recent.length,
        totalViews: sum.totalViews || 0,
        totalLikes: sum.totalLikes || 0,
        totalComments: sum.totalComments || 0,
        totalShares: sum.totalShares || 0,
        avgEngagementRate: sum.avgEngagementRate || 0,
        topPerformingPost: recent.sort((a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate)[0] || null,
        platformBreakdown,
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
        return <TwitterIcon className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'reddit':
        return <Globe className="w-4 h-4 text-orange-500" />;
      default:
        return <TwitterIcon className="w-4 h-4" />;
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
