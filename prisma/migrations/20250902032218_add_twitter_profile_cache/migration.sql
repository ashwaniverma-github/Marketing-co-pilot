-- CreateTable
CREATE TABLE "public"."twitter_profile_cache" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "followerCount" INTEGER,
    "followingCount" INTEGER,
    "avatarUrl" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_profile_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitter_profile_cache_username_key" ON "public"."twitter_profile_cache"("username");
