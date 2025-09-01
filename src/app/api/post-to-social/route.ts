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
      if (platform === 'twitter') {
        return await postToTwitter(clean, session.user.id);
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

async function postToTwitter(content: string, userId: string) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Look up connected Twitter account for this user
      const account = await db.account.findFirst({
        where: { userId, provider: 'twitter' },
        select: { 
          access_token: true, 
          scope: true, 
          expires_at: true,
          refresh_token: true 
        },
      });

      if (!account?.access_token) {
        return NextResponse.json({ 
          error: 'Twitter account not connected. Please connect your X account first.',
          needsAuth: true 
        }, { status: 401 });
      }

      // Check if token is expired
      if (account.expires_at && account.expires_at * 1000 < Date.now()) {
        return NextResponse.json({ 
          error: 'Twitter access token has expired. Please reconnect your X account.',
          needsAuth: true 
        }, { status: 401 });
      }

      // Ensure token has write scope
      const scope = (account.scope || '').toLowerCase();
      if (!scope.includes('tweet.write')) {
        return NextResponse.json({ 
          error: 'Twitter connection missing tweet.write permission. Please reconnect X with write access.',
          needsAuth: true 
        }, { status: 401 });
      }

      // Debug: Log token info (without exposing the actual token)
      console.log('Posting to Twitter:', {
        hasToken: !!account.access_token,
        tokenLength: account.access_token?.length,
        scope: account.scope,
        expiresAt: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : 'no expiry',
        contentLength: content.length
      });

      // Call Twitter API v2: POST /2/tweets with timeout and error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Twitter API error:', data);
        
        // Handle specific Twitter API errors
        if (res.status === 401) {
          return NextResponse.json({ 
            error: 'Twitter authentication failed. Your access token may be invalid or expired. Please reconnect your X account.',
            needsAuth: true 
          }, { status: 401 });
        }
        
        if (res.status === 403) {
          return NextResponse.json({ 
            error: 'Permission denied. Your X account may not have tweet write permissions. Please reconnect with proper permissions.',
            needsAuth: true 
          }, { status: 403 });
        }
        
        if (res.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please wait a few minutes before trying again.',
            retryAfter: res.headers.get('x-rate-limit-reset') 
          }, { status: 429 });
        }
        
        return NextResponse.json({ 
          error: data?.detail || data?.title || 'Failed to post to X',
          apiError: data 
        }, { status: 502 });
      }

      // Return tweet id so client can persist with the exact post
      return NextResponse.json({ success: true, message: 'Posted to X successfully', post: data, platform: 'twitter' });

    } catch (error) {
      attempt++;
      console.error(`Twitter posting error (attempt ${attempt}/${maxRetries}):`, error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (attempt >= maxRetries) {
            return NextResponse.json(
              { error: 'Twitter API request timed out after multiple attempts. Please try again later.' },
              { status: 408 }
            );
          }
        } else if (error.message.includes('fetch failed') || error.message.includes('ConnectTimeoutError')) {
          if (attempt >= maxRetries) {
            return NextResponse.json(
              { error: 'Unable to connect to Twitter after multiple attempts. Please check your internet connection and try again.' },
              { status: 503 }
            );
          }
        } else {
          // For non-connection errors, don't retry
          return NextResponse.json(
            { error: 'Failed to post to X. Please try again later.' },
            { status: 500 }
          );
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  // If we reach here, all retries failed
  return NextResponse.json(
    { error: 'Failed to post to X after multiple attempts. Please try again later.' },
    { status: 500 }
  );
}


