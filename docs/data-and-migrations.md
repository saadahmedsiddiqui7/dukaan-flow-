# Data model and migration plan

## Current baseline

The workspace contained no application, migrations or customer data at inspection. The SQL migration in `supabase/migrations` is therefore a new baseline, not an alteration of a deployed database. It creates only tenant identity, membership, locale preferences and industry-module registration; it does not yet create customers, catalog, orders, inventory or payments.

The tenant baseline was applied to the DukaanFlow Supabase project through its SQL Editor. Because that route does not add a row to the CLI migration history automatically, record version `202611120001` as applied with the Supabase CLI before using `db push` against this project; do not rerun the create-table migration against the already initialized project.

## Foundation entities

- `businesses`: tenant root, default currency, IANA time zone, locale and optional state/UT.
- `business_memberships`: user-to-business relationship and role.
- `industry_modules`: globally registered module key and current version.
- `business_industry_modules`: business-specific enablement and selected module version.

All module enablement is additive. A business can later enable more than one pack. Module keys are stable identifiers; display names and translations belong in application metadata.

## First persisted workflow (`202611220001`)

This additive migration introduces `catalog_items` for products/services and `sales` for basic transactions. It has been applied to the connected DukaanFlow Supabase project. Both tables carry `business_id`, use integer minor currency units, record the authenticated creator, and have membership/role-aware RLS. Owners, admins, managers, and staff can add records; viewers can read but not write. The web dashboard reads these records only after sign-in. The migration does not alter the existing tenant baseline or delete data.

## Next universal entities

Introduce in later, separately reviewed migrations: `business_locations`, `parties` (customer/supplier/contact roles), formal `orders` and `order_lines`, `payments`, `inventory_movements`, `tasks`, `audit_events`, and validated module extension definitions/values. Use explicit business IDs and RLS from creation. Avoid a single polymorphic table for unrelated business records.

## Backward-compatible migration rules

1. Before any change to an existing installation, inspect live schema, migration history, row counts, constraints, indexes, RLS and backups. Never assume this baseline matches production.
2. Add nullable columns/tables/indexes first. Deploy code that can read old and new shapes, then backfill in bounded batches, verify, and only then add constraints or switch writes.
3. Keep old columns and read paths through a compatibility window. Rename/drop only in an explicitly planned later release with a recovery path.
4. Never rewrite previously applied migrations. Add a new migration for each schema change.
5. Test migrations against a copy and verify RLS as anonymous, member, and non-member identities before production.

No destructive migration or data backfill is included in this foundation. The SQL Editor application does not automatically record CLI migration history; record versions `202611120001` and `202611220001` as applied before using `supabase db push` against the connected project.
