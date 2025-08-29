import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getAuthenticatedUser(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? undefined;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const days = parseInt(searchParams.get('days') || '30');
    const platform = searchParams.get('platform');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = await db.analytics.findMany({
      where: {
        userId,
        ...(appId && { appId }),
        ...(platform && { platform: platform.toUpperCase() as any }),
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Get summary metrics
    const summary = await db.analytics.aggregate({
      where: {
        userId,
        ...(appId && { appId }),
        date: {
          gte: startDate,
        },
      },
      _sum: {
        impressions: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        clicks: true,
        signups: true,
        trials: true,
        purchases: true,
        revenue: true,
      },
      _avg: {
        engagementRate: true,
        clickThroughRate: true,
        conversionRate: true,
      },
    });

    // Get platform breakdown
    const platformBreakdown = await db.analytics.groupBy({
      by: ['platform'],
      where: {
        userId,
        ...(appId && { appId }),
        platform: {
          not: null,
        },
        date: {
          gte: startDate,
        },
      },
      _sum: {
        impressions: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        clicks: true,
      },
      _avg: {
        engagementRate: true,
        clickThroughRate: true,
      },
    });

    // Get top performing posts
    const topPosts = await db.post.findMany({
      where: {
        userId,
        ...(appId && { appId }),
        status: 'PUBLISHED',
        publishedAt: {
          gte: startDate,
        },
      },
      include: {
        app: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        engagementRate: 'desc',
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      analytics: {
        data: analytics.map(item => ({
          date: item.date.toISOString(),
          impressions: item.impressions,
          reach: item.reach,
          views: item.views,
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          clicks: item.clicks,
          signups: item.signups,
          trials: item.trials,
          purchases: item.purchases,
          revenue: item.revenue,
          engagementRate: item.engagementRate,
          clickThroughRate: item.clickThroughRate,
          conversionRate: item.conversionRate,
          platform: item.platform,
          source: item.source,
          medium: item.medium,
          campaign: item.campaign,
        })),
        summary: {
          totalImpressions: summary._sum.impressions || 0,
          totalViews: summary._sum.views || 0,
          totalLikes: summary._sum.likes || 0,
          totalComments: summary._sum.comments || 0,
          totalShares: summary._sum.shares || 0,
          totalClicks: summary._sum.clicks || 0,
          totalSignups: summary._sum.signups || 0,
          totalTrials: summary._sum.trials || 0,
          totalPurchases: summary._sum.purchases || 0,
          totalRevenue: summary._sum.revenue || 0,
          avgEngagementRate: summary._avg.engagementRate || 0,
          avgClickThroughRate: summary._avg.clickThroughRate || 0,
          avgConversionRate: summary._avg.conversionRate || 0,
        },
        platformBreakdown: platformBreakdown.map(item => ({
          platform: item.platform,
          impressions: item._sum.impressions || 0,
          views: item._sum.views || 0,
          engagement: (item._sum.likes || 0) + (item._sum.comments || 0) + (item._sum.shares || 0),
          avgEngagementRate: item._avg.engagementRate || 0,
          avgClickThroughRate: item._avg.clickThroughRate || 0,
        })),
        topPosts: topPosts.map(post => ({
          id: post.id,
          content: post.content,
          platform: post.platform.toLowerCase(),
          publishedAt: post.publishedAt,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          engagementRate: post.engagementRate,
          app: post.app,
        })),
      },
    });

  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
