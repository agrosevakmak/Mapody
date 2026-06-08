# Mapody

**Turn Google Maps links into beautiful websites in 60 seconds.**

Paste a Google Maps link, and Mapody scrapes the business data, generates AI-powered content, and publishes a multi-page website with analytics, custom themes, and a contact form — all in one click.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

---

## Features

- **Google Maps Scraping** — Paste any Google Maps link, extract business name, address, phone, reviews, photos, and hours
- **AI Content Generation** — Auto-generate page rewrites, taglines, FAQs, alt text, and sentiment analysis
- **Multi-Page Editor** — Drag-and-drop page manager with live preview
- **Custom Themes** — Choose from preset themes or create your own with custom colors, fonts, and styles
- **Analytics Dashboard** — Track page views, unique visitors, referrers, and top pages per site
- **Contact Forms** — Built-in contact form on every published site with spam protection
- **One-Click Publishing** — Deploy to a unique subdomain instantly
- **User Authentication** — Email/password + GitHub OAuth, email verification, password reset
- **Credit System** — Free tier with credit limits, upgradeable via Stripe
- **Dark Mode** — Full dark mode support across the app

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (JWT + Credentials + GitHub OAuth) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Email** | [Nodemailer](https://nodemailer.com/) |
| **Web Scraping** | [Apify](https://www.apify.com/) (Google Maps scraper) |
| **AI** | OpenAI API (content generation) |
| **File Storage** | AWS S3 (via `@aws-sdk/client-s3`) |
| **Deployment** | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech/))
- Apify account (for Google Maps scraping)
- OpenAI API key (for AI content generation)

### Installation

```bash
git clone https://github.com/agrosevakmak/Mapody.git
cd Mapody
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Apify (Google Maps scraping)
APIFY_API_TOKEN=""

# OpenAI (AI content generation)
OPENAI_API_KEY=""

# AWS S3 (file uploads)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_BUCKET_NAME=""
AWS_REGION=""

# SMTP (email delivery)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@mapody.vercel.app"

# Google Maps Embed
GOOGLE_MAPS_API_KEY=""
```

### Setup

```bash
# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
Mapody/
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── ai/          # AI endpoints (rewrite, tagline, faq, alttext, sentiment)
│   │   │   ├── auth/        # Authentication (login, signup, forgot-password, verify)
│   │   │   ├── sites/       # Site CRUD, pages, publish, duplicate
│   │   │   ├── user/        # Profile, credits, theme, preferences
│   │   │   ├── contact/     # Contact form handler
│   │   │   ├── tracking/    # Analytics tracking
│   │   │   ├── upload/      # File upload (S3)
│   │   │   ├── scrape/      # Google Maps scraping proxy
│   │   │   └── analytics/   # Analytics data endpoint
│   │   ├── auth/            # Auth pages (login, signup, forgot-password, verify)
│   │   ├── dashboard/       # User dashboard
│   │   ├── editor/          # Site editor
│   │   ├── preview/         # Site preview
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── pricing/         # Pricing page
│   │   ├── settings/        # User settings
│   │   └── support/         # Support page
│   ├── components/          # React components
│   ├── lib/                 # Utilities & services
│   │   ├── ai.ts            # OpenAI integration
│   │   ├── apify.ts         # Apify scraping client
│   │   ├── auth.ts          # NextAuth config
│   │   ├── email.ts         # Nodemailer email service
│   │   ├── prisma.ts        # Prisma client
│   │   ├── s3.ts            # AWS S3 uploads
│   │   └── utils.ts         # Shared utilities
│   ├── middleware.ts         # Rate limiting middleware
│   ├── store/               # Zustand state management
│   └── types/               # TypeScript declarations
├── .gitignore
├── LICENSE
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scrape` | Scrape Google Maps data from a URL |
| POST | `/api/ai/rewrite` | Generate AI page content |
| POST | `/api/ai/tagline` | Generate a business tagline |
| POST | `/api/ai/faq` | Generate FAQ entries |
| POST | `/api/ai/alttext` | Generate image alt text |
| POST | `/api/ai/sentiment` | Analyze review sentiment |
| GET/POST | `/api/sites` | List or create sites |
| GET/PUT/DELETE | `/api/sites/[id]` | Manage a site |
| POST | `/api/sites/[id]/publish` | Publish a site |
| POST | `/api/sites/[id]/duplicate` | Duplicate a site |
| GET/POST | `/api/sites/[id]/pages` | List or add pages |
| PUT/DELETE | `/api/sites/[id]/pages/[pageId]` | Update or delete a page |
| POST | `/api/contact` | Submit a contact form |
| POST | `/api/tracking` | Record a page view |
| POST | `/api/upload` | Upload a file to S3 |
| GET/PUT | `/api/user/profile` | Get or update user profile |
| GET/POST | `/api/user/credits` | Check or use credits |
| PUT | `/api/user/theme` | Save user theme |
| GET/PUT | `/api/user/preferences` | Get or update preferences |
| POST | `/api/analytics` | Get analytics data |

## Security Features

- **Rate Limiting** — Global middleware with per-route limits (scrape: 5/min, auth: 3/5min, AI: 20/min)
- **Input Validation** — Zod schemas for all API inputs, HTML sanitization on user content
- **Ownership Checks** — All site/page operations verify user ownership
- **Atomic Operations** — Credit deduction uses raw SQL to prevent race conditions
- **Secure Tokens** — OTP generation uses `crypto.randomInt()` instead of `Math.random()`
- **Session Security** — JWT strategy with httpOnly cookies, CSRF protection

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Built with care by [agrosevakmak](https://github.com/agrosevakmak)
