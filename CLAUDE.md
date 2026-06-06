# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This is NOT the Next.js you know

This project runs **Next.js 16**, which has breaking changes from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.

**Critical Next.js 16 changes:**
- **Middleware is now called Proxy.** The file is `proxy.ts` at project root, and it must export a function named `proxy` (not `middleware`). Both named export `export function proxy()` and default export work.
- No other structural changes to App Router.

## Commands

```bash
npm run dev      # Start dev server (Turbopack, port 3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without building

# Database
npx prisma migrate dev --name <name>   # Create + apply migration
npx prisma generate                    # Regenerate client after schema change
npx prisma studio                      # DB browser UI

# Background jobs (local dev)
npx inngest-cli@latest dev             # Start Inngest dev server (required for job processing)
```

## Architecture

### Request flow
```
proxy.ts → Supabase session refresh → redirect unauthenticated to /sign-in
         → app/(auth)/      public routes (sign-in, sign-up)
         → app/(dashboard)/ protected routes (all /brands/*)
```

### Authentication
`lib/supabase/server.ts` — SSR Supabase client (Server Components, Server Actions, Route Handlers). Always `await createClient()`.  
`lib/supabase/client.ts` — Browser Supabase client (Client Components only).  
`lib/dal.ts` — `getCurrentUser()` returns the Supabase `user.id` (UUID) or throws `"Unauthorized"`. Wrapped in React `cache()`. Every protected action calls this.  
`app/auth/callback/route.ts` — Handles email confirmation redirects from Supabase.

### Data layer
- **Reads**: `lib/db/brands.ts`, `lib/db/creatives.ts` — server-only query functions that call `getCurrentUser()` internally for ownership checks.
- **Writes**: `app/actions/*.ts` — Next.js Server Actions (`'use server'`), validated with Zod, call `getCurrentUser()` then Prisma.
- `Brand.userId` stores the Supabase `auth.users` UUID directly — no separate User table.

### Background jobs (Inngest)
Jobs live in `app/inngest/`. The Inngest route handler is at `app/api/inngest/route.ts`.

Three functions:
- `generate-creative` — triggered by `creative/generate.requested`: generates image via OpenAI `gpt-image-2`, post-processes with Sharp, uploads to R2.
- `extract-website-brand` — triggered by `brand/website.extract.requested`: scrapes with Cheerio + screenshots, analyzes with GPT-4V, writes to `BrandGuideline` and `Brand`.
- `extract-pdf-brand` — triggered by `brand/pdf.extract.requested`.

Inngest step results must be JSON-serializable — `Buffer` must be converted to `Array.from(buf)` between steps and reconstructed with `Buffer.from(array)`.

### Storage
`lib/r2.ts` — Cloudflare R2 via AWS S3 SDK. Assets stored under `creatives/`, `brand-assets/`. Public URL served from `R2_PUBLIC_URL` env var.

### AI
`lib/openai.ts` — Two clients: `openrouter` (text models via OpenRouter) and `openaiImages` (direct OpenAI, `gpt-image-2` only, may be null if key not set).  
`lib/prompts.ts` — All AI prompt strings.

## Prisma 7 specifics

**Do not put `url` or `directUrl` in `prisma/schema.prisma`** — this is removed in Prisma 7. Connection config lives entirely in `prisma.config.ts`:

```ts
// prisma.config.ts pattern
datasource: { url: process.env.DIRECT_URL }  // for migrate commands
migrate: { async adapter() { ... PrismaPg(pool) ... } }
```

`DATABASE_URL` = Supabase Transaction pooler (port 6543, `?pgbouncer=true`) — used by the app at runtime via `lib/prisma.ts`.  
`DIRECT_URL` = Supabase Session pooler or direct (port 5432) — used by `prisma migrate`.

## Env vars summary

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `DATABASE_URL` | Prisma runtime (Transaction pooler) |
| `DIRECT_URL` | Prisma migrations (direct connection) |
| `OPENROUTER_API_KEY` | Text models (GPT-4o, etc.) |
| `OPENAI_API_KEY` | Image generation only (`gpt-image-2`) |
| `CF_ACCOUNT_ID`, `R2_*` | Cloudflare R2 storage |
| `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` | Inngest (set to `local` for dev) |
