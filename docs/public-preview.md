# Public preview rollout

## What can be shared now

The web app includes an interactive footwear-retail sample workspace. Visitors can open **Explore the interactive sample workspace** without creating an account. Sample edits stay in that visitor's browser. The Supabase sign-up flow remains available to people who want to create an account.

This is an early product preview, not a complete business system. Customer, sales, inventory and AI screens are not all connected to durable business records yet. Do not invite real businesses to rely on it for operational records until those workflows are complete.

## Vercel deployment settings

- Framework: Next.js
- Root directory: `apps/web`
- Install command: `pnpm install` (workspace lockfile at repository root)
- Build command: `cd ../.. && pnpm --filter @dukaanflow/web build`
- Keep access to workspace packages outside the app root enabled for the build.
- To publish a safe demo-only preview, do not set the Supabase environment variables in Vercel. The public app then opens the sample workspace and cannot create accounts or access the Supabase project.
- To enable Supabase accounts, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel's Production environment. The publishable key is designed for clients; never set a Supabase secret key in a `NEXT_PUBLIC_` variable.

## Supabase Auth after the Vercel URL exists

Set Supabase **Authentication → URL Configuration → Site URL** to the final HTTPS Vercel URL. Add that exact URL to the redirect allow-list, plus `http://localhost:3000/**` for local testing. Add the exact production URL rather than a broad wildcard. Email confirmation links use the configured Site URL.

## Repository handling

Use a private GitHub repository for the source. `.env.local` and mobile `.env` are ignored by Git; commit only the `.env.example` templates. Vercel can import the private repo after the GitHub account is connected.
