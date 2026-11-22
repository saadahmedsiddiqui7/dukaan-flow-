# DukaanFlow

**One platform. Every business. Across India.**

DukaanFlow is an India-first business management MVP built around a universal core with room for industry-specific modules. This repository demonstrates a complete web slice: business onboarding, tenant-scoped products and sales, a read-only guest preview, and an AI assistant that answers questions about fictional demo records.

## Live preview

[Open the DukaanFlow preview](https://dukaan-flow-swart.vercel.app)

The preview is an early product prototype. Guest data is fictional. Live AI requires a server-only OpenAI API key; authenticated catalog and sales features require the catalog/sales Supabase migration to be applied to the project.

## What works

- Email sign-up/sign-in and business workspace creation with Supabase Auth.
- Guest workspace for exploring the sample dashboard without an account.
- Guest write actions lead to sign-up/sign-in.
- Authenticated users can add products/services and record paid or pending sales.
- Supabase Row Level Security scopes records to a business and its members.
- Server-side AI route uses OpenAI Responses API and fixed fictional demo data; it cannot change records.
- Shared TypeScript domain contracts for business context, catalog, and sales.
- Android-first Expo app scaffold for the planned mobile client.

## Architecture

```text
apps/web       Next.js dashboard and server-side AI route
apps/mobile    Expo / React Native Android-first client scaffold
packages/domain Shared business and industry contracts
packages/backend Supabase client factory
supabase/      Additive PostgreSQL migrations with tenant RLS
docs/          Product, architecture, migration and preview notes
```

The platform separates the universal business core from optional industry modules. Initial retail sample data is a proving ground, not a limit on supported business types. See [product specification](docs/product-spec.md), [architecture](docs/architecture.md), and [migration plan](docs/data-and-migrations.md).

## Run locally

Requirements: Node.js 20+, pnpm 10, and a Supabase project (or local Supabase CLI/Docker setup).

```bash
pnpm install
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the settings below. Then start the web app:

```bash
pnpm --filter @dukaanflow/web dev
```

Open `http://localhost:3000`.

| Variable | Where it is used | Required for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Sign-in and business workspaces |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server | Sign-in and business workspaces |
| `OPENAI_API_KEY` | Server only | AI answers in the guest demo |
| `OPENAI_MODEL` | Server only; optional | Defaults to `gpt-4.1-mini` |

Never expose a Supabase secret/service-role key or OpenAI API key through a `NEXT_PUBLIC_` variable or commit either key. The project’s `.gitignore` excludes `.env.local`.

For the mobile scaffold, use `pnpm --filter @dukaanflow/mobile start`. Mobile sign-in and the persisted workflows are planned work and are not represented as complete.

## Database setup

The connected Supabase project has tenant foundation migration `202611120001` and additive catalog/sales migration `202611220001` applied. For a new local database, start Supabase and reset it to apply all migration files in order. The dashboard SQL Editor does not record CLI migration history; record both versions as applied before using `supabase db push` against the connected project.

## Current boundaries

This portfolio MVP is a working slice, not a finished ERP. It does not include formal orders/line items, payment processing, stock movement accounting, customers, reports, offline sync, voice input, or complete industry packs. AI has no tools for making changes and answers only from its fictional sample dataset. Public AI usage requires an OpenAI API key and should be paired with provider spending limits before promotion.

## Roadmap

1. Apply and verify the catalog/sales migration against the connected Supabase project.
2. Complete workspace selection, input validation, and business-day reporting.
3. Add customers, orders, payments, and inventory movements as additive migrations.
4. Build the first configurable retail module on top of the universal records.
5. Bring authenticated core workflows to the Android client.
6. Add multilingual text/voice AI with server-authorized tools, confirmation, and audit events.
