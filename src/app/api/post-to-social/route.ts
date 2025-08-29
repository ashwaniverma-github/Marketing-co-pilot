import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function htmlToPlainText(input: string): string {
  try {
    // Very small sanitizer: strip tags, decode common entities, collapse whitespace
    const withoutTags = input.replace(/<[^>]*>/g, '');
    const decoded = withoutTags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    return decoded.replace(/[ \t\f\v\u00A0]+/g, ' ').trim();
  } catch {
    return input;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, content, scheduledAt } = await request.json();

    const clean = htmlToPlainText(String(content || ''));

    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
        { status: 400 }
      );
    }

    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Handle immediate posting
    if (!scheduledAt) {
      switch (platform) {
        case 'twitter':
          return await postToTwitter(clean, session.user.id);
        case 'linkedin':
          return await postToLinkedIn(clean);
        case 'reddit':
          return await postToReddit(clean);
        default:
          return NextResponse.json(
            { error: 'Unsupported platform' },
            { status: 400 }
          );
      }
    }

    // Handle scheduled posting
    // In production, you would store this in a database and use a job queue
    const scheduledPost = {
      id: Date.now().toString(),
      platform,
      content: clean,
      scheduledAt,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Post scheduled successfully',
      post: scheduledPost
    });

  } catch (error) {
    console.error('Social posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post content' },
      { status: 500 }
    );
  }
}

async function postToTwitter(content: string, userId: string) {
  try {
    // Look up connected Twitter account for this user
    const account = await db.account.findFirst({
      where: { userId, provider: 'twitter' },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'Twitter account not connected' }, { status: 401 });
    }

    // Call Twitter API v2: POST /2/tweets
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Twitter API error:', data);
      return NextResponse.json({ error: data?.detail || 'Failed to post to X' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Posted to X successfully', post: data, platform: 'twitter' });

  } catch (error) {
    console.error('Twitter posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post to X' },
      { status: 500 }
    );
  }
}

async function postToLinkedIn(content: string) {
  // Mock LinkedIn API implementation
  return NextResponse.json(
    { error: 'LinkedIn posting coming soon' },
    { status: 501 }
  );
}

async function postToReddit(content: string) {
  // Mock Reddit API implementation
  return NextResponse.json(
    { error: 'Reddit posting coming soon' },
    { status: 501 }
  );
}
