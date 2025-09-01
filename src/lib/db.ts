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
