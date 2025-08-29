import { PrismaClient, type Platform } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
        userPreferences: true,
      },
    });
  },

  async createWithDefaults(data: { email: string; name?: string }) {
    return db.user.create({
      data: {
        ...data,
        userPreferences: {
          create: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyReports: true,
            aiSuggestions: true,
          },
        },
      },
      include: {
        userPreferences: true,
      },
    });
  },
};

// App operations
export const appHelpers = {
  async findWithKnowledge(appId: string) {
    return db.app.findUnique({
      where: { id: appId },
      include: {
        appKnowledge: true,
        user: true,
        _count: {
          select: {
            posts: true,
            marketingCampaigns: true,
            competitors: true,
            targetAudiences: true,
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
        appKnowledge: true,
        _count: {
          select: {
            posts: true,
            marketingCampaigns: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async updateKnowledge(appId: string, knowledge: any) {
    return db.appKnowledge.upsert({
      where: { appId },
      update: {
        ...knowledge,
        lastAnalyzedAt: new Date(),
      },
      create: {
        appId,
        ...knowledge,
        lastAnalyzedAt: new Date(),
      },
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
        campaign: {
          select: {
            name: true,
            objective: true,
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

// Analytics operations
export const analyticsHelpers = {
  async getAppPerformance(appId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.analytics.findMany({
      where: {
        appId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  async getPlatformComparison(appId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.analytics.groupBy({
      by: ['platform'],
      where: {
        appId,
        date: {
          gte: startDate,
        },
        platform: {
          not: null,
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
  },

  async recordMetrics(data: {
    appId: string;
    userId: string;
    date: Date;
    platform: Platform;
    impressions?: number;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    conversions?: number;
  }) {
    const engagementRate = data.views ? 
      ((data.likes || 0) + (data.comments || 0) + (data.shares || 0)) / data.views * 100 : 0;
    
    const clickThroughRate = data.impressions ? 
      (data.clicks || 0) / data.impressions * 100 : 0;

    return db.analytics.upsert({
      where: {
        date_appId_platform: {
          date: data.date,
          appId: data.appId,
          platform: data.platform,
        },
      },
      update: {
        impressions: { increment: data.impressions || 0 },
        views: { increment: data.views || 0 },
        likes: { increment: data.likes || 0 },
        comments: { increment: data.comments || 0 },
        shares: { increment: data.shares || 0 },
        clicks: { increment: data.clicks || 0 },
        signups: { increment: data.conversions || 0 },
        engagementRate,
        clickThroughRate,
      },
      create: {
        ...data,
        platform: data.platform,
        engagementRate,
        clickThroughRate,
      },
    });
  },
};

// Campaign operations
export const campaignHelpers = {
  async findActive(userId: string) {
    return db.marketingCampaign.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        app: {
          select: {
            name: true,
            category: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  },

  async getPerformance(campaignId: string) {
    return db.campaignAnalytics.findMany({
      where: { campaignId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  },
};

// Growth suggestions operations
export const growthHelpers = {
  async findPending(appId: string) {
    return db.growthSuggestion.findMany({
      where: {
        appId,
        status: 'PENDING',
      },
      orderBy: [
        { priority: 'desc' },
        { aiConfidence: 'desc' },
      ],
    });
  },

  async markImplemented(suggestionId: string, results?: any) {
    return db.growthSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'COMPLETED',
        implementedAt: new Date(),
        results,
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
    return db.socialAccount.update({
      where: { id: accountId },
      data: {
        ...tokens,
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
