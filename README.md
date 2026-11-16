# DukaanFlow

**One platform. Every business. Across India.**

DukaanFlow is an India-first business management platform with a universal core and optional industry modules. It is designed for Android-first use, with a web dashboard and shared TypeScript domain packages.

## Repository status

This repository was empty when implementation began. The files here establish the initial product and engineering foundation; no existing application or customer data was present to migrate.

## Product direction

- Universal business records and workflows, extended by industry packs.
- Android-first Expo / React Native app and a Next.js web dashboard.
- Supabase for Postgres, authentication and storage.
- Multilingual text and voice AI, subject to user confirmation before consequential actions.
- Indian localization from the start: INR, time zone, locale preferences, state/UT and GST-ready extension points.

See [product specification](docs/product-spec.md), [architecture](docs/architecture.md), and [data and migration plan](docs/data-and-migrations.md).

## Planned workspace

```text
apps/mobile       Expo + React Native client
apps/web          Next.js dashboard
packages/domain   Shared domain types and industry module contracts
supabase/         SQL migrations and backend configuration
docs/             Product, architecture, and data decisions
```

Apps and dependencies will be introduced in small increments. This foundation intentionally avoids generated lockfiles and dependency installs until a package manager and local environment are confirmed.

## Local prerequisites

- Node.js 20 or newer and pnpm 10.
- Docker Desktop and Supabase CLI to run the local database and apply migrations.
- A Supabase project and public URL/key before connecting either client. Never add a service-role key to a client app.

After installing those tools, run `pnpm install`, `pnpm typecheck`, and `supabase start` from the repository root. The current execution environment has none of those tools, so these steps have not yet been run.

## Web prototype

The first interactive prototype is in `apps/web`. It uses sample footwear retail data and lets you switch workspace sections, search inventory, add a sale, and preview the AI assistant screen. Its browser state is temporary and resets on refresh. It does not connect to Supabase or represent production records. The domain contracts and workflow decisions are intended to carry into the mobile app; web visual components will be recreated with native controls rather than copied directly into React Native.
