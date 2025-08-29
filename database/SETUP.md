# Database Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @prisma/client prisma ts-node
npm run db:generate
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.template .env

# Edit .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/launch_studio"
```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
createdb launch_studio
```

#### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name launch-studio-db \
  -e POSTGRES_DB=launch_studio \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL will be:
# postgresql://your_username:your_password@localhost:5432/launch_studio
```

#### Option C: Cloud PostgreSQL (Recommended for Production)

**Supabase (Free tier available):**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your database URL from Settings → Database
4. Update `.env` with the connection string

**Neon (Serverless PostgreSQL):**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string
4. Update `.env`

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy the connection string

### 4. Run Migrations
```bash
# Push schema to database
npm run db:push

# Or create and run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 5. Verify Setup
```bash
# Open Prisma Studio to browse data
npm run db:studio
```

## 📊 Schema Overview

### Core Tables
- **users** - Indie hackers using the platform
- **apps** - Apps/products being marketed
- **app_knowledge** - AI-generated insights about apps
- **posts** - Social media content
- **analytics** - Performance metrics
- **marketing_campaigns** - Organized marketing efforts

### Supporting Tables
- **social_accounts** - Connected social media accounts
- **growth_suggestions** - AI-powered growth recommendations
- **competitors** - Competitive analysis
- **target_audiences** - Customer personas
- **distribution_channels** - Marketing channels

## 🔧 Common Operations

### Adding New User
```typescript
import { userHelpers } from '@/lib/db';

const user = await userHelpers.createWithDefaults({
  email: 'indie@hacker.com',
  name: 'Indie Hacker'
});
```

### Creating App with Knowledge
```typescript
import { db, appHelpers } from '@/lib/db';

const app = await db.app.create({
  data: {
    name: 'My SaaS App',
    url: 'https://myapp.com',
    category: 'SAAS',
    userId: user.id,
  }
});

await appHelpers.updateKnowledge(app.id, {
  valueProposition: 'Solving productivity for teams',
  targetAudience: 'Small business owners',
  // ... other knowledge fields
});
```

### Recording Analytics
```typescript
import { analyticsHelpers } from '@/lib/db';

await analyticsHelpers.recordMetrics({
  appId: 'app-id',
  userId: 'user-id',
  date: new Date(),
  platform: 'TWITTER',
  impressions: 1000,
  views: 800,
  likes: 50,
  comments: 10,
  shares: 15,
  clicks: 40,
});
```

### Scheduling X Posts
```typescript
import { db } from '@/lib/db';

const post = await db.post.create({
  data: {
    content: 'Just shipped a new feature! 🚀\n\nBuilding in public with fellow indie hackers. What would you like to see next?',
    hashtags: ['indiehackers', 'buildinpublic', 'saas'],
    platform: 'TWITTER',
    status: 'SCHEDULED',
    scheduledFor: new Date('2024-02-15T10:00:00Z'),
    userId: 'user-id',
    appId: 'app-id',
    socialAccountId: 'account-id',
  }
});
```

## 🔄 Data Migration

### Backup Database
```bash
# Local PostgreSQL
pg_dump launch_studio > backup.sql

# Restore
psql launch_studio < backup.sql
```

### Reset Database
```bash
# Caution: This will delete all data
npm run db:reset
npm run db:seed
```

### Update Schema
```bash
# After modifying schema.prisma
npm run db:generate
npm run db:migrate
```

## 📈 Performance Optimization

### Indexes
The schema includes optimized indexes for:
- User apps lookup
- Post scheduling queries
- Analytics time-series data
- Platform performance comparisons
- Content search

### Queries
Use the helper functions in `/src/lib/db.ts` for optimized queries:
```typescript
// Efficient app performance lookup
const performance = await analyticsHelpers.getAppPerformance('app-id', 30);

// Platform comparison with aggregations
const comparison = await analyticsHelpers.getPlatformComparison('app-id');

// Scheduled posts for processing
const scheduled = await postHelpers.findScheduled(100);
```

## 🔐 Security

### Environment Variables
Never commit these to version control:
- `DATABASE_URL`
- API keys and secrets
- OAuth tokens

### Data Encryption
- OAuth tokens are stored encrypted
- Sensitive user data is isolated by user ID
- All queries include proper authorization checks

### Backups
Set up automated backups:
```bash
# Daily backup script
0 2 * * * pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## 🐛 Troubleshooting

### Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check Prisma client generation
npx prisma generate
```

### Migration Errors
```bash
# Force reset if migrations are out of sync
npx prisma migrate reset
npx prisma db push
```

### Performance Issues
```bash
# Analyze slow queries
EXPLAIN ANALYZE SELECT ...

# Check index usage
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats WHERE tablename = 'your_table';
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Database Design Best Practices](https://www.prisma.io/dataguide/postgresql)

## 🎯 Next Steps

1. Set up your database environment
2. Run migrations and seed data
3. Test the application with demo data
4. Set up automated backups
5. Configure monitoring and alerts

Your indie hacker marketing platform database is now ready! 🚀
