-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."AppCategory" AS ENUM ('PRODUCTIVITY', 'SAAS', 'MOBILE_APP', 'WEB_APP', 'DEVELOPER_TOOLS', 'DESIGN_TOOLS', 'MARKETING_TOOLS', 'ECOMMERCE', 'EDUCATION', 'GAMING', 'FINANCE', 'HEALTH_FITNESS', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AppStage" AS ENUM ('IDEA', 'DEVELOPMENT', 'BETA', 'LAUNCHED', 'SCALING', 'MATURE');

-- CreateEnum
CREATE TYPE "public"."AppStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "public"."CampaignObjective" AS ENUM ('AWARENESS', 'ENGAGEMENT', 'TRAFFIC', 'LEADS', 'CONVERSIONS', 'RETENTION', 'GROWTH');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('TWITTER', 'LINKEDIN', 'REDDIT', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TIKTOK', 'MEDIUM', 'DEV_TO', 'HACKER_NEWS', 'PRODUCT_HUNT');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."GrowthCategory" AS ENUM ('SEO', 'CONTENT_MARKETING', 'SOCIAL_MEDIA', 'PAID_ADVERTISING', 'EMAIL_MARKETING', 'PRODUCT_OPTIMIZATION', 'USER_EXPERIENCE', 'CONVERSION_OPTIMIZATION', 'PARTNERSHIP', 'PR_OUTREACH', 'COMMUNITY_BUILDING', 'RETENTION');

-- CreateEnum
CREATE TYPE "public"."EffortLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."SuggestionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."ChannelType" AS ENUM ('SOCIAL_MEDIA', 'CONTENT_PLATFORM', 'APP_STORE', 'MARKETPLACE', 'DIRECTORY', 'COMMUNITY', 'PAID_ADS', 'EMAIL', 'AFFILIATE', 'PARTNERSHIP', 'PR_MEDIA', 'ORGANIC_SEARCH');

-- CreateEnum
CREATE TYPE "public"."TemplateCategory" AS ENUM ('LAUNCH_ANNOUNCEMENT', 'FEATURE_UPDATE', 'USER_TESTIMONIAL', 'BEHIND_THE_SCENES', 'EDUCATIONAL_CONTENT', 'PROMOTIONAL', 'COMMUNITY_ENGAGEMENT', 'MILESTONE_CELEBRATION', 'PROBLEM_SOLUTION', 'COMPARISON');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('POST_SCHEDULED', 'POST_PUBLISHED', 'POST_FAILED', 'CAMPAIGN_STARTED', 'CAMPAIGN_COMPLETED', 'ANALYTICS_MILESTONE', 'GROWTH_SUGGESTION', 'ACCOUNT_CONNECTED', 'ACCOUNT_EXPIRED', 'PLAN_UPGRADE', 'SYSTEM_UPDATE');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('ANALYTICS', 'EMAIL_MARKETING', 'CRM', 'PAYMENT', 'WEBHOOK', 'ZAPIER', 'SLACK', 'DISCORD', 'NOTION');

-- CreateEnum
CREATE TYPE "public"."IntegrationStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR', 'DISABLED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "aiSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "autoScheduling" BOOLEAN NOT NULL DEFAULT false,
    "defaultTimezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "logoUrl" TEXT,
    "category" "public"."AppCategory" NOT NULL DEFAULT 'PRODUCTIVITY',
    "stage" "public"."AppStage" NOT NULL DEFAULT 'IDEA',
    "status" "public"."AppStatus" NOT NULL DEFAULT 'ACTIVE',
    "launchDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_knowledge" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "valueProposition" TEXT,
    "targetAudience" TEXT,
    "keyFeatures" TEXT[],
    "uniqueSellingPoints" TEXT[],
    "marketSize" TEXT,
    "competitiveAdvantage" TEXT,
    "pricingStrategy" TEXT,
    "revenueModel" TEXT,
    "painPoints" TEXT[],
    "benefits" TEXT[],
    "emotionalTriggers" TEXT[],
    "messagingFramework" JSONB,
    "primaryKeywords" TEXT[],
    "longTailKeywords" TEXT[],
    "contentThemes" TEXT[],
    "brandTone" TEXT,
    "brandPersonality" TEXT[],
    "communicationStyle" TEXT,
    "brandGuidelines" JSONB,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "confidenceScore" DOUBLE PRECISION,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" "public"."CampaignObjective" NOT NULL DEFAULT 'AWARENESS',
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "targetAudience" JSONB,
    "geoTargeting" TEXT[],
    "impressionGoal" INTEGER,
    "engagementGoal" DOUBLE PRECISION,
    "conversionGoal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_accounts" (
    "id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "followerCount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "hashtags" TEXT[],
    "mentions" TEXT[],
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "platform" "public"."Platform" NOT NULL,
    "platformPostId" TEXT,
    "threadPosition" INTEGER,
    "parentPostId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "campaignId" TEXT,
    "socialAccountId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "signups" INTEGER NOT NULL DEFAULT 0,
    "trials" INTEGER NOT NULL DEFAULT 0,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clickThroughRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerClick" DOUBLE PRECISION,
    "costPerAcquisition" DOUBLE PRECISION,
    "platform" "public"."Platform",
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."growth_suggestions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."GrowthCategory" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "effort" "public"."EffortLevel" NOT NULL,
    "impact" "public"."ImpactLevel" NOT NULL,
    "actionItems" TEXT[],
    "estimatedROI" TEXT,
    "timeframe" TEXT,
    "status" "public"."SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "implementedAt" TIMESTAMP(3),
    "results" JSONB,
    "aiConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "sourceAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "growth_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."distribution_channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ChannelType" NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "traffic" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "distribution_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."target_audiences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ageRange" TEXT,
    "gender" TEXT,
    "location" TEXT,
    "income" TEXT,
    "occupation" TEXT,
    "interests" TEXT[],
    "painPoints" TEXT[],
    "goals" TEXT[],
    "behaviors" TEXT[],
    "primaryPlatforms" "public"."Platform"[],
    "estimatedSize" INTEGER,
    "lifetimeValue" DOUBLE PRECISION,
    "acquisitionCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "target_audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."competitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."AppCategory",
    "marketShare" DOUBLE PRECISION,
    "estimatedRevenue" DOUBLE PRECISION,
    "fundingStage" TEXT,
    "teamSize" TEXT,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "features" TEXT[],
    "pricing" JSONB,
    "marketingStrategy" TEXT,
    "contentStrategy" TEXT,
    "socialPresence" JSONB,
    "trafficRank" INTEGER,
    "socialFollowers" JSONB,
    "isMonitoring" BOOLEAN NOT NULL DEFAULT false,
    "lastAnalyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."TemplateCategory" NOT NULL,
    "structure" JSONB NOT NULL,
    "variables" TEXT[],
    "platforms" "public"."Platform"[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "averagePerformance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."IntegrationType" NOT NULL,
    "status" "public"."IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "credentials" JSONB,
    "lastSyncAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "public"."users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "public"."user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "app_knowledge_appId_key" ON "public"."app_knowledge"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_platform_platformUserId_key" ON "public"."social_accounts"("platform", "platformUserId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_date_appId_platform_key" ON "public"."analytics"("date", "appId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_analytics_date_campaignId_key" ON "public"."campaign_analytics"("date", "campaignId");

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apps" ADD CONSTRAINT "apps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."app_knowledge" ADD CONSTRAINT "app_knowledge_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."marketing_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "public"."social_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "public"."posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_analytics" ADD CONSTRAINT "campaign_analytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."marketing_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."growth_suggestions" ADD CONSTRAINT "growth_suggestions_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distribution_channels" ADD CONSTRAINT "distribution_channels_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."target_audiences" ADD CONSTRAINT "target_audiences_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competitors" ADD CONSTRAINT "competitors_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
