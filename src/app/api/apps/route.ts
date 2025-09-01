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

export async function GET(_: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();

    const apps = await db.app.findMany({
      where: { 
        userId,
        status: 'ACTIVE',
      },
      include: {
        scrapedData: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      apps: apps.map(app => ({
        id: app.id,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        url: app.url,
        logoUrl: app.logoUrl,
        category: app.category,
        stage: app.stage,
        status: app.status.toLowerCase(),
        launchDate: app.launchDate,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        scrapedData: app.scrapedData,
        stats: {
          posts: app._count.posts,
          campaigns: 0,
        },
      })),
    });

  } catch (error) {
    const isAuth = (error as Error)?.message === 'Not authenticated';
    if (isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch apps error:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { name, tagline, description, url, category, stage } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const app = await db.app.create({
      data: {
        name,
        tagline,
        description,
        url,
        category: category || 'OTHER',
        stage: stage || 'IDEA',
        status: 'ACTIVE',
        userId,
      },
      include: {
        scrapedData: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      app: {
        id: app.id,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        url: app.url,
        category: app.category,
        stage: app.stage,
        status: app.status.toLowerCase(),
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        scrapedData: app.scrapedData,
        stats: {
          posts: app._count.posts,
          campaigns: 0,
        },
      },
    });

  } catch (error) {
    const isAuth = (error as Error)?.message === 'Not authenticated';
    if (isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create app error:', error);
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 });
  }
}
