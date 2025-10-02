import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        streak: true,
        longestStreak: true,
        lastCheckIn: true,
        weeklyCheckIns: true,
        contentGenerated: true,
        threadsCreated: true,
        editingIterations: true,
        lastContentGeneratedAt: true,
        xPostsCount: true,
        aiGeneratedTweets: true,
      },
    });

    console.log('User data fetched:', JSON.stringify(user, null, 2));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate marketing health score (0-100)
    const healthScore = calculateMarketingHealthScore(user);

    // Get recent activity for heatmap
    const recentEvents = await db.gamificationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { type: true, createdAt: true },
    });

    const profile = {
      ...user,
      healthScore,
      recentActivity: recentEvents,
    };

    console.log('Returning profile:', JSON.stringify(profile, null, 2));

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Gamification profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { incrementFields } = body;

    // Validate input
    if (!incrementFields || typeof incrementFields !== 'object') {
      return NextResponse.json({ error: 'Invalid increment fields' }, { status: 400 });
    }

    // Allowed fields to increment
    const allowedFields = [
      'xp', 
      'streak', 
      'weeklyCheckIns', 
      'contentGenerated', 
      'threadsCreated', 
      'editingIterations', 
      'xPostsCount', 
      'aiGeneratedTweets'
    ];

    // Validate each field
    for (const field of Object.keys(incrementFields)) {
      if (!allowedFields.includes(field)) {
        return NextResponse.json({ error: `Cannot increment field: ${field}` }, { status: 400 });
      }
      if (typeof incrementFields[field] !== 'number') {
        return NextResponse.json({ error: `Invalid increment value for ${field}` }, { status: 400 });
      }
    }

    // Perform the increment
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...Object.fromEntries(
          Object.entries(incrementFields).map(([field, value]) => [field, { increment: value }])
        )
      },
      select: {
        xp: true,
        level: true,
        streak: true,
        longestStreak: true,
        lastCheckIn: true,
        weeklyCheckIns: true,
        contentGenerated: true,
        threadsCreated: true,
        editingIterations: true,
        xPostsCount: true,
        aiGeneratedTweets: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile: updatedUser 
    });
  } catch (error) {
    console.error('Error incrementing gamification fields:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

function calculateMarketingHealthScore(user: any): number {
  let score = 0;
  
  // Content generation frequency (30 points)
  const totalContentGeneration = (user.contentGenerated || 0) + (user.xPostsCount || 0);
  if (totalContentGeneration > 0) {
    score += Math.min(30, totalContentGeneration * 2);
  }
  
  // Consistency streak (25 points)
  if (user.streak > 0) {
    score += Math.min(25, user.streak * 2);
  }
  
  // Content variety (20 points)
  const varietyScore = (user.threadsCreated > 0 ? 10 : 0) + 
                      (user.editingIterations > 0 ? 5 : 0) +
                      (user.xPostsCount > 0 ? 5 : 0);
  score += Math.min(20, varietyScore);
  
  // Recent activity (15 points)
  const daysSinceLastContent = user.lastContentGeneratedAt 
    ? Math.floor((Date.now() - new Date(user.lastContentGeneratedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastContent <= 1) score += 15;
  else if (daysSinceLastContent <= 3) score += 10;
  else if (daysSinceLastContent <= 7) score += 5;
  
  // Weekly engagement (10 points)
  if (user.weeklyCheckIns >= 5) score += 10;
  else if (user.weeklyCheckIns >= 3) score += 7;
  else if (user.weeklyCheckIns >= 1) score += 3;
  
  return Math.min(100, Math.max(0, score));
}
