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
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');

    const posts = await db.post.findMany({
      where: {
        userId,
        ...(appId && { appId }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(platform && { platform: platform.toUpperCase() as any }),
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
        socialAccount: {
          select: {
            platform: true,
            username: true,
            displayName: true,
          },
        },

      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        hashtags: post.hashtags,
        mentions: post.mentions,
        mediaUrls: post.mediaUrls,
        platform: post.platform.toLowerCase(),
        status: post.status.toLowerCase(),
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        platformPostId: post.platformPostId,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        clicks: post.clicks,
        engagementRate: post.engagementRate,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        app: post.app,
        socialAccount: post.socialAccount,
      })),
    });

  } catch (error) {
    const isAuth = (error as Error)?.message === 'Not authenticated';
    if (isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();

    // Normalize content to plain text if HTML was provided
    const normalize = (value: unknown) => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

    const { 
      content, 
      hashtags, 
      platform, 
      appId, 
      socialAccountId, 
      scheduledFor, 
      status = 'DRAFT',
      platformPostId
    } = body;

    if (!content || !platform || !appId) {
      return NextResponse.json(
        { error: 'Content, platform, and appId are required' },
        { status: 400 }
      );
    }

    // Verify the app belongs to the user
    const app = await db.app.findFirst({
      where: { id: appId, userId },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found or not authorized' },
        { status: 404 }
      );
    }

    // If no social account provided, try to find or create one for the platform
    let finalSocialAccountId = socialAccountId;
    if (!finalSocialAccountId) {
      let socialAccount = await db.socialAccount.findFirst({
        where: {
          userId,
          platform: platform.toUpperCase(),
          isActive: true,
        },
      });
      
      if (!socialAccount) {
        if (platform.toUpperCase() === 'TWITTER') {
          // Try to bootstrap a SocialAccount from NextAuth account
          const oauthAccount = await db.account.findFirst({
            where: { userId, provider: 'twitter' },
            select: { id: true, providerAccountId: true, access_token: true },
          });

          if (oauthAccount?.providerAccountId) {
            const created = await db.socialAccount.create({
              data: {
                platform: 'TWITTER',
                platformUserId: oauthAccount.providerAccountId,
                username: `@${oauthAccount.providerAccountId}`,
                displayName: 'Twitter',
                isVerified: false,
                isActive: true,
                userId,
                accountId: oauthAccount.id,
              },
            });
            socialAccount = created as any;
          }
        }

        if (!socialAccount) {
          return NextResponse.json(
            { error: `No connected ${platform} account found` },
            { status: 400 }
          );
        }
      }
      
      finalSocialAccountId = socialAccount.id;
    }

    const post = await db.post.create({
      data: {
        content: normalize(content),
        hashtags: hashtags || [],
        mentions: [],
        mediaUrls: [],
        platform: platform.toUpperCase(),
        status: status.toUpperCase(),
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        userId,
        appId,
        socialAccountId: finalSocialAccountId,
        platformPostId: platformPostId || null,
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
        socialAccount: {
          select: {
            platform: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        hashtags: post.hashtags,
        platform: post.platform.toLowerCase(),
        status: post.status.toLowerCase(),
        scheduledFor: post.scheduledFor,
        createdAt: post.createdAt.toISOString(),
        app: post.app,
        socialAccount: post.socialAccount,
      },
    });

  } catch (error) {
    const isAuth = (error as Error)?.message === 'Not authenticated';
    if (isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
