# Getting Started with Riftlytics

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For version control
- **PostgreSQL**: For database (optional for development, use Supabase free tier)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/riftlytics.git
cd riftlytics
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/riftlytics

# Riot API - Get from https://developer.riotgames.com/
RIOT_API_KEY=your-api-key-here

# Supabase - Create free account at https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For Phase 2+
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Optional: For Phase 3
OPENAI_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# App
NODE_ENV=development
LOG_LEVEL=debug
```

### Step 4: Set Up Database (Supabase)

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy the URL and Keys to `.env.local`
4. Set up Prisma:

```bash
npm run prisma:generate
npm run prisma:push
```

This creates the database schema.

### Step 5: Configure Preset Summoners

Edit `src/constants/presetSummoners.ts` with your League of Legends accounts:

```typescript
export const PRESET_SUMMONERS = [
  {
    name: 'Your Account',
    summonerName: 'YourGameName#NA1',
    region: 'na1',
  },
  // Add your friends' accounts
];
```

**Note**: Summoner names use the new format: `GameName#TagLine` (e.g., `Faker#NA1`)

### Step 6: Get a Riot API Key

1. Go to [https://developer.riotgames.com/](https://developer.riotgames.com/)
2. Sign in with your League of Legends account
3. Create a new API Key
4. Add it to `.env.local` as `RIOT_API_KEY`

### Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create migration
npm run prisma:push      # Push schema changes
npm run prisma:studio    # Open Prisma Studio UI
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Change the port
npm run dev -- -p 3001
```

### Prisma Schema Issues

```bash
# Reset the database (warning: deletes all data)
npm run prisma:migrate reset

# Re-generate Prisma client
npm run prisma:generate
```

### API Key Not Working

1. Verify you're using the correct API key from the Riot Developer Portal
2. Check your rate limits: 20 requests/second
3. Ensure the summoner name exists and uses the correct format: `GameName#TagLine`

### Summoner Not Found Error

- Verify the summoner name is correct
- Check they play on the correct region (NA1, EUW1, etc.)
- Wait a few minutes if the account was recently created

## Next Steps

1. Familiarize yourself with the [Code Standards](CLAUDE.md)
2. Check out [Contributing Guidelines](CONTRIBUTING.md)
3. Read the [Project Documentation](CLAUDE.md)

## Getting Help

- Check existing issues on GitHub
- Create a new issue for bugs
- Ask questions in discussions
- See [Contributing Guidelines](CONTRIBUTING.md)

Happy coding! 🚀
