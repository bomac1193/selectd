# SELECTD

**The Taste Battle Game**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-private-red)

A competitive multiplayer music taste evaluation platform where users drop tracks, battle head-to-head, and earn reputation through crowd voting.

---

## What This Is

SELECTD gamifies music taste through 1v1 track battles. Users submit ("drop") their favorite tracks, enter battles against other players, and the crowd votes to determine the winner. The platform tracks reputation, conviction scores, and maintains leaderboards across multiple dimensions.

**In the TASTE Ecosystem:** SELECTD serves as the game layer—generating engagement signals (votes, drops, battles) that flow to CANORA for credentialing. It's where taste is tested and proven before works can achieve cultural permanence.

**Audience:** Music enthusiasts, curators, and fans who want to compete, discover new music, and build their reputation as tastemakers.

---

## Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TASTE ECOSYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│   │   SELECTD    │ ──────► │   CANORA     │ ──────► │  ISSUANCE    │       │
│   │  (Game)      │ signals │(Credentialing)│ graduate│ (Settlement) │       │
│   │              │         │              │         │              │       │
│   │ • Battles    │         │ • JAM        │         │ • Registry   │       │
│   │ • Drops      │         │ • PLATE      │         │ • Fractions  │       │
│   │ • Votes      │         │ • CANON      │         │ • Blockchain │       │
│   └──────────────┘         └──────────────┘         └──────────────┘       │
│         │                         ▲                                        │
│         │    vote, drop,          │                                        │
│         │    battle_win/loss,     │                                        │
│         │    mission_complete     │                                        │
│         └─────────────────────────┘                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Outbound to CANORA:**
   - Creates CANORA works when drops are approved
   - Sends signals: `vote`, `drop`, `battle_win`, `battle_loss`, `mission_complete`
   - Fetches shadow/novelty scores and audio analysis

2. **From CANORA:**
   - Receives discovery data (shadow scores, novelty scores)
   - Gets audio analysis (BPM, key, emotion vectors)
   - Similar track recommendations

### APIs Exposed

| Endpoint | Description |
|----------|-------------|
| `/api/drops` | Create/list track drops |
| `/api/battles` | Create/join/list battles |
| `/api/battles/[id]/vote` | Cast vote in battle |
| `/api/leaderboard` | Rankings by various metrics |
| `/api/missions` | Active missions and progress |
| `/api/profile` | User profile and stats |

### APIs Consumed

| Service | Endpoint | Purpose |
|---------|----------|---------|
| CANORA | `/api/v1/works` | Create works from drops |
| CANORA | `/api/v1/works/[id]/signal` | Send engagement signals |
| CANORA | `/api/v1/discover` | Track discovery |

---

## Features

### Game Modes
- ✅ **Curator Mode** — Drop tracks, enter battles, build reputation
- ✅ **Fan Mode** — Follow artists, vote in battles, build conviction score

### Core Gameplay
- ✅ Track drops with auto-approval
- ✅ 1v1 battle matchmaking (60s timeout)
- ✅ Crowd voting with conviction scoring (0-100)
- ✅ Battle results and winner determination
- ✅ Vote correctness tracking

### Progression System
- ✅ XP and leveling (1000 XP per level, max 100)
- ✅ Taste Points currency
- ✅ Daily/Weekly missions with rewards
- ✅ Login streak tracking
- ✅ Mission auto-completion

### Reputation Metrics
- ✅ Curator Rep (battle performance)
- ✅ Fan Rep (artist following)
- ✅ Conviction Score (vote accuracy)
- ✅ 6-axis taste profile (emotion matching)

### Leaderboards
- ✅ Multiple ranking types (Curator Rep, Fan Rep, Win Rate, Conviction, XP, Taste Points)
- ✅ Daily/Weekly/All-time periods
- ✅ Top tracks ranking

### Integrations
- ✅ CANORA sync (drops → works, signals)
- ✅ Audio analysis via CANORA/Etherfeed
- 🔜 ISSUANCE (credentials for achievements)

---

## Setup Checklist

### Prerequisites

- [ ] Node.js 20+
- [ ] PostgreSQL database (Supabase recommended)
- [ ] Google OAuth app credentials
- [ ] Discord OAuth app credentials
- [ ] CANORA API key (optional but recommended)

### Environment Variables

Create `.env.local` with:

```bash
# Database (required)
DATABASE_URL=               # Supabase pooled connection (?pgbouncer=true)
DIRECT_URL=                 # Supabase direct connection

# Authentication (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=            # Run: openssl rand -base64 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# CANORA Integration (recommended)
CANORA_API_URL=https://canora.vercel.app
CANORA_API_KEY=

# ISSUANCE Integration (future)
ISSUANCE_API_URL=https://issuance.vercel.app
ISSUANCE_API_KEY=
```

### Installation

```bash
# Clone the repository
git clone https://github.com/bomac1193/selectd.git
cd selectd

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in environment variables (see above)

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Verify Setup

- [ ] App runs on http://localhost:3000
- [ ] Can login with Google or Discord
- [ ] Database tables created (check Prisma Studio: `npx prisma studio`)
- [ ] Can create a drop via /drop
- [ ] Can create and join battles via /battle
- [ ] Leaderboard displays at /leaderboard
- [ ] Profile page loads at /profile

---

## API Reference

### Drops

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/drops` | Create new drop |
| GET | `/api/drops` | List drops (approved, mine, top, search) |

### Battles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battles` | Create or join battle |
| GET | `/api/battles` | List active battles |
| GET | `/api/battles/[id]` | Get battle details |
| POST | `/api/battles/[id]/vote` | Cast vote (with conviction) |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard?type=X` | Get specific leaderboard |
| GET | `/api/leaderboard?view=all` | Get all leaderboards |
| GET | `/api/leaderboard?view=tracks` | Get top tracks |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile + stats |
| PATCH | `/api/profile` | Update username or preferredMode |

### Missions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/missions` | Get active missions + progress |

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Working | Google + Discord OAuth |
| Drop System | ✅ Working | Auto-approval, CANORA sync |
| Battle System | ✅ Working | Matchmaking, voting, results |
| Reputation System | ✅ Working | All rep types calculated |
| Missions | ✅ Working | Daily/weekly with auto-complete |
| Leaderboards | ✅ Working | All 6 types with periods |
| CANORA Integration | ✅ Working | Drops sync, signals sent |
| ISSUANCE Integration | ⏸️ Disabled | ENV vars defined, no implementation |
| Real-time Updates | 🔜 Planned | WebSocket support pending |

---

## Next Steps

1. **Add real-time battle updates** — WebSocket integration for live voting
2. **Implement ISSUANCE credentials** — Blockchain achievements for milestones
3. **Build artist battle mode UI** — Full fan mode experience
4. **Add moderation dashboard** — Admin tools for drop review
5. **Enhanced discovery** — Leverage CANORA discovery for better matchmaking

---

## Telegram Mini App (Next Steps)

Use these after the Telegram quickstart is running.

1. **Update BotFather links** — `/myapps` → Edit link → paste the current ngrok URL, and `/setmenubutton` → Web App URL → paste the same URL.
2. **Test the bot entry** — In Telegram, open your bot and send `/start`, then tap **Open SELECTD**.
3. **Verify webhook** — `curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"` and confirm it points to `<ngrok-url>/api/telegram/webhook`.
4. **Swap to production** — Replace the ngrok URL in BotFather with your Vercel URL once deployed.
5. **Final verification** — Re-test `/start` and the in-app flow using the production URL.

---

## Related Repos

- [CANORA](https://github.com/bomac1193/canora) — Credentialing platform that receives SELECTD signals
- [ISSUANCE](https://github.com/bomac1193/issuance) — Settlement layer for blockchain credentials
- [ETHERFEED](https://github.com/bomac1193/etherfeed) — Audio analysis service (via CANORA)

---

## Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript 5)
- **Database:** PostgreSQL with Prisma ORM (Supabase)
- **Auth:** NextAuth v5 (Google, Discord OAuth)
- **UI:** Tailwind CSS 4, Framer Motion
- **Styling:** Dark mode with neon accents (pink, cyan, purple)

---

## Game Mechanics

### Battle Flow

```
1. Player 1 creates battle with track → MATCHING (60s)
2. Player 2 joins with their track → VOTING (2 min)
3. Crowd votes with conviction (0-100)
4. Winner determined by vote count
5. Stats updated, signals sent to CANORA
```

### Reputation Weights

| Action | Impact |
|--------|--------|
| Battle win | +2 |
| Battle loss | -0.5 |
| Correct vote | +1 |
| Incorrect vote | -0.25 |
| Drop approved | +1.5 |
| Artist followed | +0.5 |

---

*DROP. BATTLE. WIN.*
