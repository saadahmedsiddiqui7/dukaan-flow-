# Public preview rollout

## What can be shared now

The web app includes an interactive footwear-retail sample workspace. Visitors can open **Explore the interactive sample workspace** without creating an account. The guest workspace is read-only; tapping **Add a sale** or **Add product** returns visitors to the sign-up/sign-in screen. The Supabase account flow remains available to people who want their own workspace.

This is an early product preview, not a complete business system. Guest AI answers only from fictional sample records. Authenticated catalog items and basic sales are designed to persist in Supabase after the `202611220001` migration is applied. Formal orders, payment collection, stock movements, reporting, and the mobile client are not complete; do not rely on this MVP for full business operations.

## Vercel deployment settings

- Framework: Next.js
- Root directory: `apps/web`
- Install command: `pnpm install` (workspace lockfile at repository root)
- Build command: `cd ../.. && pnpm --filter @dukaanflow/web build`
- Keep access to workspace packages outside the app root enabled for the build.
- To publish a safe demo-only preview, do not set the Supabase environment variables in Vercel. The public app then opens the sample workspace and cannot create accounts or access the Supabase project.
- To enable Supabase accounts, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel's Production environment. The publishable key is designed for clients; never set a Supabase secret key in a `NEXT_PUBLIC_` variable.
- To enable guest Dukaan AI, add `OPENAI_API_KEY` as a server-only Production environment variable in Vercel. Do not prefix it with `NEXT_PUBLIC_`, commit it, or put it in a browser-visible setting. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`. The public demo endpoint accepts up to 10 questions per minute per observed client IP in each running instance and uses a fixed fictional dataset; production traffic controls should be added before broad public promotion.
- The additive catalog/sales migration `202611220001` has been applied to the connected project. For another environment, apply `supabase/migrations/202611220001_catalog_and_sales.sql` after the tenant foundation. It does not replace or rerun the tenant baseline.

## Supabase Auth after the Vercel URL exists

Set Supabase **Authentication → URL Configuration → Site URL** to the final HTTPS Vercel URL. Add that exact URL to the redirect allow-list, plus `http://localhost:3000/**` for local testing. Add the exact production URL rather than a broad wildcard. Email confirmation links use the configured Site URL.

## Repository handling

Use a private GitHub repository for the source. `.env.local` and mobile `.env` are ignored by Git; commit only the `.env.example` templates. Vercel can import the private repo after the GitHub account is connected.
