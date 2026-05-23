# Riftlytics Project Documentation

> **AI-powered League of Legends friend group analytics and duo compatibility platform**

---

## 🎯 Project Vision & Goals

### Primary Objectives

1. **Social Profile Comparison**: View and compare multiple friends' LoL stats side-by-side
2. **Personal Analytics**: Track individual performance metrics, trends, and insights
3. **Duo Compatibility Analysis** (Future): AI-powered assessment of player synergy and team composition compatibility

### Success Metrics

- Load player profiles in <2s
- Support 5-10 active users with smooth updates
- Real-time stat comparison with <30s refresh intervals
- High-quality AI analysis generation in <10s

---

## 🏗️ Tech Stack & Architecture

### Core Stack (Current)

- **Frontend**: Next.js 15+ (App Router), React, TypeScript
- **Data Fetching**: TanStack Query for client-side caching
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM + Supabase PostgreSQL
- **League API**: Direct fetching (no OAuth needed for MVP)

### Recommended Additions (After MVP)

- **Caching Layer**: Upstash Redis (serverless, rate limit protection)
- **Background Jobs**: Inngest (periodic PDL snapshots)
- **Validation**: Zod (type-safe API responses)
- **Authentication**: NextAuth.js or simple API key (for future phases)
- **AI Integration**: OpenAI/Claude API (Phase 3)

### Architecture Decision: Why These Choices

| Component       | Choice        | Rationale                                                                          |
| --------------- | ------------- | ---------------------------------------------------------------------------------- |
| **API Caching** | Upstash Redis | Riot API has strict rate limits; prevents hitting ceiling with multiple users      |
| **Job Queue**   | Inngest       | Serverless (no infrastructure), scales automatically, integrates well with Next.js |
| **Storage**     | Supabase      | Postgres reliability, good for relational data (players, matches, comparisons)     |
| **AI Layer**    | Claude API    | Better contextual understanding of LoL meta than GPT for analysis                  |

---

## 📐 Project Phases

### Phase 1: MVP (2-3 weeks)

**Goal**: Display preset profiles (op.gg-like interface) with profile data, match history, and performance analysis

- [ ] Hardcode preset summoner names (you + friends)
- [ ] Create `/api/profile/[summonerName]` endpoint (fetches live League API data)
- [ ] Create `/api/matches/[summonerName]` endpoint (fetches recent match data)
- [ ] Design database schema for PDL snapshots (not full match history)
- [ ] Build UI components (ProfileCard, MatchCard, StatsCard, Header)
- [ ] Implement TanStack Query hooks for profile/match data
- [ ] Deploy to production with basic monitoring

**Deliverables**:

- Home page displaying your profile + 3-5 friend profiles
- Individual profile view (rank, LP, main champions, role distribution)
- Recent match history (last 20 matches from API)
- Performance metrics display (KDA, CS, gold, etc.)
- Side-by-side stat comparison

### Phase 2: Analytics & Tracking (3-4 weeks)

**Goal**: Historical PDL tracking + trend analysis

- [ ] Implement daily PDL snapshot collection (background job)
- [ ] Add caching layer (Upstash Redis)
- [ ] Create background job system (Inngest for periodic PDL snapshots)
- [ ] Build analytics dashboard with trend charts
- [ ] Add champion pool analysis
- [ ] Performance optimization with Redis caching

**Deliverables**:

- Trend analysis charts (LP progression over 7/30 days)
- Champion pool insights (most played, best/worst winrate)
- Shared champion pool comparison
- Rank/tier history
- Performance alerts (ranked up/demoted)

### Phase 3: AI Duo Analysis (4-6 weeks)

**Goal**: AI-powered duo compatibility rating

- [ ] Integrate Claude API
- [ ] Design LoL meta knowledge prompt
- [ ] Create analysis prompt chain
- [ ] Store analysis results in Prisma
- [ ] Build UI for results display
- [ ] Add analysis history/comparison

**Deliverables**:

- Duo compatibility scoring (1-10)
- Strengths & weaknesses analysis
- Recommended team compositions
- Counter-pick suggestions

---

## ⚡ Key Technical Challenges & Solutions

### 1. **Riot API Rate Limits**

- **Problem**: 20 requests/1s per API key, 100/2m burst
- **Solution**:
  - Cache player data with Upstash Redis (TTL: 1 hour for profiles, 30m for live games)
  - Use background jobs (Inngest) to refresh data asynchronously
  - Implement request queuing

### 2. **Real-time Stats vs API Refresh**

- **Problem**: Stats don't update in real-time; refreshing too often hits rate limits
- **Solution**:
  - Set TanStack Query stale time to 5 minutes
  - Manual "refresh" button with debounce
  - Background jobs refresh every 30-60 minutes
  - Never auto-refresh more than once per minute

### 3. **No Authentication in MVP**

- **Problem**: OAuth setup adds complexity; MVP doesn't need it
- **Solution**:
  - Use public League API endpoints (no token required for basic data)
  - Hardcode summoner names in a config file
  - Add authentication only when adding user accounts (Phase 2+)

### 4. **Historical Data Storage**

- **Problem**: League API only keeps last 20 matches; doesn't track historical rank/LP changes
- **Solution**:
  - Store only PDL snapshots (rank, LP, win rate) daily via background jobs
  - Don't store full match data (keep API data fresh)
  - Query full match history on-demand from API
  - Use Redis to cache current profiles

### 5. **AI Analysis Cost & Latency**

- **Problem**: Claude API calls add latency and cost
- **Solution**:
  - Cache analysis results (rerun only if stats change >10%)
  - Queue analysis requests (batch process at off-peak times)
  - Show loading state; don't block profile view
  - Set max 1 analysis/day per duo (cost control)

---

## 📊 Database Schema (Prisma) - MVP Version

```prisma
model Player {
  id              String    @id @default(cuid())
  summonerName    String    @unique              // Summoner name from Riot API
  riotId          String    @unique              // Puuid from Riot API
  displayName     String                         // Display name for UI

  pdlSnapshots    PDLSnapshot[]                  // Historical rank/LP data
  duoAnalyses     DuoAnalysis[]                  // For Phase 3

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// PDL = Performance Data Line (daily snapshots)
model PDLSnapshot {
  id              String    @id @default(cuid())
  playerId        String
  player          Player    @relation(fields: [playerId], references: [id], onDelete: Cascade)

  // Rank Data
  rank            String                         // DIAMOND, PLATINUM, GOLD, etc
  tier            Int                            // 1-4 (I-IV)
  leaguePoints    Int                            // 0-100
  wins            Int
  losses          Int

  // Stats
  winRate         Float                          // Calculated: wins / (wins + losses) * 100
  mainRole        String?                        // TOP, JUNGLE, MID, ADC, SUPPORT
  mainChampion    String?                        // Most played champion

  // Metadata
  capturedAt      DateTime  @default(now())     // When this snapshot was taken

  @@unique([playerId, capturedAt])
  @@index([playerId, capturedAt])
}

model DuoAnalysis {
  id              String    @id @default(cuid())
  player1Id       String
  player1         Player    @relation(fields: [player1Id], references: [id], onDelete: Cascade)
  player2Id       String

  compatibilityScore Float   // 1-10
  strengths       String    // AI-generated analysis
  weaknesses      String
  recommendations String

  cachedUntil     DateTime  // When to refresh analysis
  createdAt       DateTime  @default(now())

  @@unique([player1Id, player2Id])
}
```

### MVP Database Approach

- **No User table**: MVP has no login, just hardcoded preset summoners
- **Player table**: Stores summoner info fetched from League API
- **PDLSnapshot**: Daily snapshots of rank/LP (only key metrics, not full history)
- **Match data**: Fetched on-demand from League API, never stored
- **Future**: Add User table when adding authentication in Phase 2

---

## 🚀 Development Workflow

### Environment Setup - MVP

```bash
# Required .env.local variables (MVP)
RIOT_API_KEY=                     # From Riot Developer Portal

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional for Phase 2+
UPSTASH_REDIS_REST_URL=          # For caching (Phase 2)
UPSTASH_REDIS_REST_TOKEN=

INNGEST_EVENT_KEY=               # For background jobs (Phase 2)
INNGEST_SIGNING_KEY=

OPENAI_API_KEY=                   # For Phase 3 (AI analysis)
```

### Key API Endpoints to Build - MVP

```
GET    /api/profile/[summonerName]    - Fetch profile from League API + cache
GET    /api/matches/[summonerName]    - Fetch recent matches from League API
GET    /api/player/[summonerName]     - Get stored player data + PDL history
```

### Future Endpoints (Phase 2+)

```
POST   /api/pdl/snapshot              - Store daily PDL snapshot (background job)
GET    /api/players                   - List all tracked players
POST   /api/analysis/duo              - Trigger duo compatibility analysis
GET    /api/cache/invalidate          - Admin endpoint
```

### Testing Strategy - MVP

- **Unit**: TanStack Query hooks with Mock Service Worker (mock League API responses)
- **Integration**: API routes with test summoner names
- **E2E**: Playwright tests for profile display + comparison
- **Manual**: Test with real players to verify data accuracy

---

## 📝 Code Style & Standards

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **API Routes**: RESTful structure, proper status codes
- **Error Handling**: Use Zod for validation, custom error classes
- **Comments**: Document why, not what; include links to Riot API docs

---

## 🎓 Learning Resources

- [Riot API Documentation](https://developer.riotgames.com/docs)
- [League of Legends Wiki](https://leagueoflegends.fandom.com/wiki/League_of_Legends_Wiki)
- [TanStack Query Guide](https://tanstack.com/query/latest)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Inngest Workflows](https://www.inngest.com/docs/guides/nextjs)

---

## 🔐 Security Checklist - MVP

- [ ] Never commit API keys (use .env.local)
- [ ] Validate all Riot API responses with Zod
- [ ] Implement rate limiting on API routes (use Next.js middleware)
- [ ] Track League API rate limit headers
- [ ] Don't store full match data (reduces data exposure)
- [ ] Log API errors (not sensitive data)
- [ ] Monitor Supabase connection limits

---

## 📈 Monitoring & Analytics

Add instrumentation for:

- API response times (track rate limit hits)
- Cache hit/miss ratios
- AI analysis latency & costs
- Error rates by endpoint
- User engagement metrics

Tools: Vercel Analytics, Sentry for errors, custom dashboards

---

## 💡 Future Enhancements

1. **Mobile App**: React Native version
2. **Discord Bot**: Query profiles via Discord commands
3. **Team Builder**: AI-powered team comp generator
4. **Patch Notes Integration**: Auto-update context when patches change
5. **Live Game Spectating**: Web interface for watching friend games
6. **Ranked 5v5 Tracker**: Team performance analytics
7. **Betting/Prediction Market**: Predict outcomes of duo games
8. **Community Features**: Leaderboards, player profiles, guides

---

_Last Updated: May 22, 2026_
_Maintainer: Your Team_
