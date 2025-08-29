-- Launch Studio Database Setup
-- Optimized for Indie Hacker Marketing Platform

-- Create database (run this separately if needed)
-- CREATE DATABASE launch_studio;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes

-- Create custom types for better performance
CREATE TYPE user_plan AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE app_category AS ENUM (
  'PRODUCTIVITY', 'SAAS', 'MOBILE_APP', 'WEB_APP', 'DEVELOPER_TOOLS',
  'DESIGN_TOOLS', 'MARKETING_TOOLS', 'ECOMMERCE', 'EDUCATION', 'GAMING',
  'FINANCE', 'HEALTH_FITNESS', 'SOCIAL', 'OTHER'
);
CREATE TYPE app_stage AS ENUM ('IDEA', 'DEVELOPMENT', 'BETA', 'LAUNCHED', 'SCALING', 'MATURE');
CREATE TYPE app_status AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED', 'DISCONTINUED');
CREATE TYPE platform AS ENUM (
  'TWITTER', 'LINKEDIN', 'REDDIT', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE',
  'TIKTOK', 'MEDIUM', 'DEV_TO', 'HACKER_NEWS', 'PRODUCT_HUNT'
);
CREATE TYPE post_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'DELETED');
CREATE TYPE campaign_objective AS ENUM (
  'AWARENESS', 'ENGAGEMENT', 'TRAFFIC', 'LEADS', 'CONVERSIONS', 'RETENTION', 'GROWTH'
);
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE growth_category AS ENUM (
  'SEO', 'CONTENT_MARKETING', 'SOCIAL_MEDIA', 'PAID_ADVERTISING', 'EMAIL_MARKETING',
  'PRODUCT_OPTIMIZATION', 'USER_EXPERIENCE', 'CONVERSION_OPTIMIZATION',
  'PARTNERSHIP', 'PR_OUTREACH', 'COMMUNITY_BUILDING', 'RETENTION'
);
CREATE TYPE effort_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE impact_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE channel_type AS ENUM (
  'SOCIAL_MEDIA', 'CONTENT_PLATFORM', 'APP_STORE', 'MARKETPLACE', 'DIRECTORY',
  'COMMUNITY', 'PAID_ADS', 'EMAIL', 'AFFILIATE', 'PARTNERSHIP', 'PR_MEDIA', 'ORGANIC_SEARCH'
);

-- Performance optimization indexes
-- These will be created automatically by Prisma, but listing for reference

-- Users table indexes
-- CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
-- CREATE INDEX CONCURRENTLY idx_users_plan ON users (plan);
-- CREATE INDEX CONCURRENTLY idx_users_created_at ON users (created_at);

-- Apps table indexes  
-- CREATE INDEX CONCURRENTLY idx_apps_user_id ON apps (user_id);
-- CREATE INDEX CONCURRENTLY idx_apps_category ON apps (category);
-- CREATE INDEX CONCURRENTLY idx_apps_stage ON apps (stage);
-- CREATE INDEX CONCURRENTLY idx_apps_status ON apps (status);
-- CREATE INDEX CONCURRENTLY idx_apps_launch_date ON apps (launch_date);

-- Posts table indexes
-- CREATE INDEX CONCURRENTLY idx_posts_user_id ON posts (user_id);
-- CREATE INDEX CONCURRENTLY idx_posts_app_id ON posts (app_id);
-- CREATE INDEX CONCURRENTLY idx_posts_platform ON posts (platform);
-- CREATE INDEX CONCURRENTLY idx_posts_status ON posts (status);
-- CREATE INDEX CONCURRENTLY idx_posts_scheduled_for ON posts (scheduled_for);
-- CREATE INDEX CONCURRENTLY idx_posts_published_at ON posts (published_at);
-- CREATE INDEX CONCURRENTLY idx_posts_engagement ON posts (engagement_rate DESC);

-- Analytics table indexes (time-series optimized)
-- CREATE INDEX CONCURRENTLY idx_analytics_date_app ON analytics (date DESC, app_id);
-- CREATE INDEX CONCURRENTLY idx_analytics_date_platform ON analytics (date DESC, platform);
-- CREATE INDEX CONCURRENTLY idx_analytics_app_date ON analytics (app_id, date DESC);

-- Text search indexes for content discovery
-- CREATE INDEX CONCURRENTLY idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
-- CREATE INDEX CONCURRENTLY idx_apps_search ON apps USING gin(to_tsvector('english', name || ' ' || COALESCE(tagline, '') || ' ' || COALESCE(description, '')));

-- Composite indexes for common queries
-- CREATE INDEX CONCURRENTLY idx_posts_user_status_date ON posts (user_id, status, created_at DESC);
-- CREATE INDEX CONCURRENTLY idx_campaigns_app_status ON marketing_campaigns (app_id, status);

-- Partial indexes for active records
-- CREATE INDEX CONCURRENTLY idx_apps_active ON apps (user_id, updated_at DESC) WHERE status = 'ACTIVE';
-- CREATE INDEX CONCURRENTLY idx_social_accounts_active ON social_accounts (user_id) WHERE is_active = true;

-- Functions for analytics and reporting

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_likes INTEGER,
  p_comments INTEGER, 
  p_shares INTEGER,
  p_views INTEGER
) RETURNS NUMERIC AS $$
BEGIN
  IF p_views = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(
    ((p_likes + p_comments + p_shares)::NUMERIC / p_views::NUMERIC) * 100, 
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get app performance summary
CREATE OR REPLACE FUNCTION get_app_performance_summary(
  p_app_id TEXT,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
  total_posts INTEGER,
  total_impressions BIGINT,
  total_engagement BIGINT,
  avg_engagement_rate NUMERIC,
  best_performing_platform TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_posts,
    SUM(a.impressions)::BIGINT as total_impressions,
    SUM(a.likes + a.comments + a.shares)::BIGINT as total_engagement,
    AVG(a.engagement_rate)::NUMERIC as avg_engagement_rate,
    (
      SELECT p.platform::TEXT
      FROM analytics a2
      JOIN posts p ON p.id::TEXT = a2.post_id
      WHERE p.app_id = p_app_id
        AND a2.date BETWEEN p_start_date AND p_end_date
      GROUP BY p.platform
      ORDER BY AVG(a2.engagement_rate) DESC
      LIMIT 1
    ) as best_performing_platform
  FROM analytics a
  JOIN posts p ON p.id::TEXT = a.post_id
  WHERE p.app_id = p_app_id
    AND a.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending hashtags for an app
CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_app_id TEXT,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE(hashtag TEXT, usage_count BIGINT, avg_engagement NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(p.hashtags) as hashtag,
    COUNT(*)::BIGINT as usage_count,
    AVG(p.engagement_rate)::NUMERIC as avg_engagement
  FROM posts p
  WHERE p.app_id = p_app_id
    AND p.status = 'PUBLISHED'
    AND p.published_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY unnest(p.hashtags)
  HAVING COUNT(*) >= 2
  ORDER BY avg_engagement DESC, usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic analytics updates

-- Update post engagement rate when analytics are updated
CREATE OR REPLACE FUNCTION update_post_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts 
  SET 
    views = NEW.views,
    likes = NEW.likes,
    comments = NEW.comments,
    shares = NEW.shares,
    engagement_rate = calculate_engagement_rate(NEW.likes, NEW.comments, NEW.shares, NEW.views)
  WHERE id::TEXT = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_update_post_engagement
--   AFTER INSERT OR UPDATE ON analytics
--   FOR EACH ROW
--   WHEN (NEW.post_id IS NOT NULL)
--   EXECUTE FUNCTION update_post_engagement_rate();

-- Views for common queries

-- App dashboard summary view
CREATE OR REPLACE VIEW app_dashboard_summary AS
SELECT 
  a.id,
  a.name,
  a.category,
  a.stage,
  a.status,
  a.created_at,
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT mc.id) as total_campaigns,
  COALESCE(SUM(an.impressions), 0) as total_impressions,
  COALESCE(SUM(an.likes + an.comments + an.shares), 0) as total_engagement,
  COALESCE(AVG(an.engagement_rate), 0) as avg_engagement_rate,
  MAX(p.published_at) as last_post_date
FROM apps a
LEFT JOIN posts p ON a.id = p.app_id AND p.status = 'PUBLISHED'
LEFT JOIN marketing_campaigns mc ON a.id = mc.app_id
LEFT JOIN analytics an ON a.id = an.app_id
GROUP BY a.id, a.name, a.category, a.stage, a.status, a.created_at;

-- User activity summary view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.plan,
  COUNT(DISTINCT a.id) as total_apps,
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT sa.id) as connected_accounts,
  MAX(p.created_at) as last_activity
FROM users u
LEFT JOIN apps a ON u.id = a.user_id
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN social_accounts sa ON u.id = sa.user_id AND sa.is_active = true
GROUP BY u.id, u.name, u.email, u.plan;

-- Platform performance comparison view
CREATE OR REPLACE VIEW platform_performance AS
SELECT 
  platform,
  COUNT(DISTINCT p.user_id) as active_users,
  COUNT(*) as total_posts,
  AVG(engagement_rate) as avg_engagement_rate,
  SUM(views) as total_views,
  SUM(likes + comments + shares) as total_engagement
FROM posts p
WHERE p.status = 'PUBLISHED'
  AND p.published_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY platform
ORDER BY avg_engagement_rate DESC;

-- Insert initial data for development/testing
-- Demo user and sample app removed

-- Grant permissions (adjust based on your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

COMMIT;
