# DukaanFlow architecture

## Shape

```text
Expo / React Native (Android first)       Next.js web dashboard
                    \                         /
                     Shared TypeScript domain contracts
                                  |
                  Supabase Auth + Postgres + Storage
                                  |
               Server-side policies and business operations
```

Both clients use the same Supabase project and business rules. The web and mobile interfaces may differ in navigation and interaction, but must not define separate business data models.

## Layers

1. **Universal core:** stable IDs, tenant boundaries, common records and cross-industry workflows.
2. **Industry modules:** versioned additions that declare capabilities, fields, statuses and optional workflows. A module must not fork shared records.
3. **Business configuration:** enabled modules, locale, terminology, custom fields and configurable workflows, validated against safe schemas.

Persist stable machine keys; translate labels at the presentation layer. Use explicit typed module contracts, and treat arbitrary JSON as extension data rather than the main query surface.

## Tenant security

Every tenant-owned row carries a business identifier. Supabase Row Level Security is mandatory for client-accessible tables. Membership checks and role checks are performed in policies or trusted server functions. Service credentials never ship to either client. Cross-tenant access must be denied by default.

## AI and voice

The client handles capture and playback through replaceable speech providers. A server-side orchestration layer handles transcription/LLM calls, structured tool validation, authorization, confirmation gates and audit events. Provider credentials remain server-side. Locale and language are inputs to recognition and response, not database identifiers.

## Data conventions

- UUID primary keys; UTC timestamps; explicit currency and integer minor-unit amounts.
- Business timezone and locale preferences on the business profile.
- Explicit status and type columns for commonly filtered values.
- JSONB only for bounded, versioned module configuration or extension attributes, with validation and size limits.
- Additive, forward-only migrations; avoid destructive edits to deployed schemas.

## Delivery sequence

1. Product/specification and tenant/module schema foundation.
2. Shared domain package and one vertical slice across mobile, web and backend.
3. Authentication, onboarding, membership management and RLS verification.
4. First core records and workflows; add the first industry pack as configuration and extensions.
5. Voice/text AI with confirmation and audit support.
6. Additional modules driven by validated business needs.
