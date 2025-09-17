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

export const config = {
  api: {
    bodyParser: true,
  },
};

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

    console.log('Posting to social:', { platform, content, scheduledAt });
    // Handle immediate posting
    if (!scheduledAt) {
      if (platform === 'twitter') {
        // Local function for posting to Twitter
        const postToTwitterPrisma = async (content: string, userId: string) => {
          // fetch the linked account
          const account = await db.account.findFirst({
            where: { userId, provider: 'twitter' }, // your stored provider string likely 'twitter'
            select: {
              id: true,
              access_token: true,
              refresh_token: true,
              expires_at: true,
              scope: true
            }
          });

          if (!account?.access_token) {
            return NextResponse.json({
              error: 'Twitter account not connected. Please connect your X account first.',
              needsAuth: true
            }, { status: 401 });
          }

          // If token already expired, try refresh first
          if (account.expires_at && account.expires_at * 1000 < Date.now()) {
            try {
              const refreshed = await refreshTwitterTokenPrisma(account);
              account.access_token = refreshed.access_token;
              account.refresh_token = refreshed.refresh_token;
              account.expires_at = refreshed.expires_at;
            } catch (err) {
              console.error('Initial token refresh failed:', err);
              return NextResponse.json({
                error: 'Twitter access token expired and refresh failed. Please reconnect your X account.',
                needsAuth: true
              }, { status: 401 });
            }
          }

          // helper to POST a tweet with timeout
          const doPost = async (token: string) => {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 30_000);
            try {
              const res = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: content }),
                signal: controller.signal
              });
              return res;
            } finally {
              clearTimeout(t);
            }
          };

          try {
            let res = await doPost(account.access_token!);

            // If we still get 401, try a single refresh+retry (covers token rotation or invalidated token)
            if (res.status === 401) {
              console.log('Got 401 when posting → trying refresh once');
              try {
                const refreshed = await refreshTwitterTokenPrisma(account);
                res = await doPost(refreshed.access_token);
              } catch (refreshErr) {
                console.error('Refresh after 401 failed:', refreshErr);
                return NextResponse.json({
                  error: 'Twitter authentication failed. Please reconnect your X account.',
                  needsAuth: true
                }, { status: 401 });
              }
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              // rate-limits & permission handling
              if (res.status === 429) {
                return NextResponse.json({
                  error: 'Rate limit exceeded. Please try again later.',
                  retryAfter: res.headers.get('x-rate-limit-reset')
                }, { status: 429 });
              }
              if (res.status === 403) {
                return NextResponse.json({
                  error: 'Permission denied. Reconnect X with tweet.write permission.',
                  needsAuth: true
                }, { status: 403 });
              }
              // generic error
              return NextResponse.json({
                error: data?.detail || data?.title || 'Failed to post to X',
                apiError: data
              }, { status: 502 });
            }

            return NextResponse.json({
              success: true,
              message: 'Posted to X successfully',
              post: data,
              platform: 'twitter'
            });
          } catch (error) {
            console.error('Posting to Twitter failed:', error);
            return NextResponse.json({
              error: 'Failed to post to X. Please try again later.'
            }, { status: 500 });
          }
        };

        return await postToTwitterPrisma(clean, session.user.id);
      } else {
        return NextResponse.json(
          { error: 'Only X (Twitter) posting is supported' },
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

// Assumes: import { db } from '@/lib/db' (Prisma client)
// and Node 18+ or a fetch polyfill available on server

async function refreshTwitterTokenPrisma(account: {
  id: string;
  refresh_token?: string | null;
  scope?: string | null;
}, ) {
  if (!account?.refresh_token) {
    throw new Error('No refresh token available');
  }

  const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: account.refresh_token,
    client_id: process.env.TWITTER_CLIENT_ID!,
  });

  const headers: Record<string,string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  // If your Twitter app is "confidential" include Basic auth header
  if (process.env.TWITTER_CLIENT_SECRET) {
    const basic = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
  }

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Twitter token refresh failed:', json);
    throw new Error(json.error_description || json.error || 'Failed to refresh Twitter token');
  }

  // expected keys: access_token, expires_in (seconds), refresh_token (maybe), scope
  const newAccessToken: string = json.access_token;
  const newRefreshToken: string = json.refresh_token ?? account.refresh_token;
  const expiresIn = json.expires_in ? Number(json.expires_in) : null;
  const newExpiresAt = expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null;

  // Persist new tokens in Prisma
  await db.account.update({
    where: { id: account.id },
    data: {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      scope: json.scope ?? account.scope,
      expires_at: newExpiresAt ?? null, // Prisma Int? field
    },
  });

  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    expires_at: newExpiresAt
  };
}



