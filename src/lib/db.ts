import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? [ 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Helper functions for common database operations

// User operations
export const userHelpers = {
  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: {
        apps: {
          where: { status: 'ACTIVE' },
          orderBy: { updatedAt: 'desc' },
        },
        socialAccounts: {
          where: { isActive: true },
        },
      },
    });
  },

  async createWithDefaults(data: { email: string; name?: string }) {
    return db.user.create({
      data: {
        ...data,
      },
    });
  },
};

// App operations
export const appHelpers = {
  async findWithScrapedData(appId: string) {
    return db.app.findUnique({
      where: { id: appId },
      include: {
        scrapedData: true,
        user: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  },

  async findUserApps(userId: string) {
    return db.app.findMany({
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
  },
};

// Post operations
export const postHelpers = {
  async findScheduled(limit = 50) {
    return db.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        app: true,
        user: true,
        socialAccount: true,
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit,
    });
  },

  async findByApp(appId: string, options?: {
    status?: string;
    platform?: string;
    limit?: number;
  }) {
    return db.post.findMany({
      where: {
        appId,
        ...(options?.status && { status: options.status as any }),
        ...(options?.platform && { platform: options.platform as any }),
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });
  },

  async updatePerformance(postId: string, metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
  }) {
    const engagementRate = metrics.views ? 
      ((metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)) / metrics.views * 100 : 0;

    return db.post.update({
      where: { id: postId },
      data: {
        ...metrics,
        engagementRate,
        updatedAt: new Date(),
      },
    });
  },
};

// Social account operations
export const socialHelpers = {
  async findByUser(userId: string, activeOnly = true) {
    return db.socialAccount.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { platform: 'asc' },
    });
  },

  async updateTokens(accountId: string, tokens: {
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
  }) {
    // Find the SocialAccount to get the linked Account
    const socialAccount = await db.socialAccount.findUnique({
      where: { id: accountId },
      include: { account: true }
    });

    if (socialAccount?.accountId) {
      // Update tokens in the Account table
      await db.account.update({
        where: { id: socialAccount.accountId },
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: tokens.tokenExpiresAt ? Math.floor(tokens.tokenExpiresAt.getTime() / 1000) : null,
        },
      });
    }

    // Update sync status in SocialAccount
    return db.socialAccount.update({
      where: { id: accountId },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'SUCCESS',
      },
    });
  },

  async markSyncError(accountId: string, error: string) {
    return db.socialAccount.update({
      where: { id: accountId },
      data: {
        syncStatus: 'ERROR',
        lastSyncAt: new Date(),
      },
    });
  },
};

export default db;

// Gamification helpers
export const gamificationHelpers = {
  async recordEvent(userId: string, type: import('@prisma/client').GamificationEventType, meta?: Record<string, unknown>) {
    await db.gamificationEvent.create({
      data: { userId, type, meta: meta as any },
    });
  },

  async awardXp(userId: string, xpToAdd: number) {
    // Simple level formula: level up every 500 XP
    const user = await db.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpToAdd },
      },
      select: { id: true, xp: true, level: true },
    });

    const targetLevel = Math.max(1, Math.floor(user.xp / 500) + 1);
    if (targetLevel !== user.level) {
      await db.user.update({ where: { id: userId }, data: { level: targetLevel } });
    }
  },

  async checkIn(userId: string) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const user = await db.user.findUnique({ where: { id: userId }, select: { lastCheckIn: true, streak: true, longestStreak: true, weeklyCheckIns: true } });

    const last = user?.lastCheckIn ? new Date(user.lastCheckIn) : undefined;
    let newStreak = (user?.streak ?? 0);

    if (!last) {
      newStreak = 1;
    } else {
      const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.floor((startOfToday.getTime() - startOfLast.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        // already checked in today
        return { alreadyCheckedIn: true } as const;
      } else if (diffDays === 1) {
        newStreak = (user?.streak ?? 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    const newLongest = Math.max(user?.longestStreak ?? 0, newStreak);

    // Weekly check-ins: reset if week changed
    const now = new Date();
    const currentWeek = getWeekKey(now);
    const lastWeek = last ? getWeekKey(last) : undefined;
    const weeklyCheckIns = lastWeek && lastWeek === currentWeek ? (user?.weeklyCheckIns ?? 0) + 1 : 1;

    await db.user.update({
      where: { id: userId },
      data: {
        lastCheckIn: startOfToday,
        streak: newStreak,
        longestStreak: newLongest,
        weeklyCheckIns,
      },
    });

    await db.gamificationEvent.create({ data: { userId, type: 'CHECK_IN' } as any });
    await gamificationHelpers.awardXp(userId, 5);

    return { alreadyCheckedIn: false, streak: newStreak, weeklyCheckIns } as const;
  },

  async incrementContentCounters(userId: string, options: { isThread?: boolean; isDraft?: boolean; edited?: boolean }) {
    const updates: any = { contentGenerated: { increment: 1 }, lastContentGeneratedAt: new Date() };
    if (options?.isThread) updates.threadsCreated = { increment: 1 };
    if (options?.isDraft) updates.draftsSaved = { increment: 1 };
    if (options?.edited) updates.editingIterations = { increment: 1 };

    await db.user.update({ where: { id: userId }, data: updates });
  },
};

function getWeekKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
