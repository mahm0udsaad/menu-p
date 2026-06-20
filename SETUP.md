# Local Development Setup

Run the **menu-p** dev server on your own machine.

## Prerequisites

- **Node.js 22** (the project was verified on `v22.22.2`)
- **pnpm** (`npm install -g pnpm`)

## Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local env file
cp .env.example .env.local
# The NEXT_PUBLIC_SUPABASE_* values are pre-filled (public client keys).
# Fill in any CHANGE_ME secrets only for the features you need.

# 3. Start the dev server
pnpm dev
```

Then open **http://localhost:3000** in your browser.

## Notes

- The app **boots without secrets** — `lib/supabase/client.ts` falls back to a
  stub when Supabase env vars are missing, so the UI renders even with a bare
  `.env.local`. The Supabase URL/anon key are included in `.env.example` so
  auth and data work out of the box against the `menu-p` project.
- Optional integrations (Google AI, Paymob payments, SMTP email, social
  posting) only activate once you supply their secrets in `.env.local`.
- Verified: `pnpm install` resolves cleanly and `pnpm dev` serves `GET / → 200`
  on Next.js 15.5.19 with no compile errors.

## Other scripts

```bash
pnpm build      # production build (runs Tailwind build + next build)
pnpm start      # serve the production build
pnpm lint       # eslint
```
