# DukaanFlow product specification

## Product

DukaanFlow is a universal business operating system for Indian small and growing businesses. Its core handles common records and operations; industry packs add focused workflows, terminology and fields without splitting the product into disconnected applications.

**Principle:** One platform. Every business. Across India.

## Product decisions

| Area | Decision |
|---|---|
| First platform | Android-first mobile app |
| Additional client | Next.js web dashboard |
| Backend | Supabase / PostgreSQL |
| AI interaction | Text and voice, using structured tools over shared business records |
| Languages | Multilingual from the beginning; user and business locale preferences |
| Data model | Universal core + versioned industry modules + business-specific configuration |
| Initial validation | Retail/wholesale workflows, including footwear, as a proving ground only |

## Universal core

The common layer is intended to cover organizations and locations, memberships and roles, customers/suppliers/other parties, products and services, orders and line items, payments, inventory movements, staff, tasks, and audit history. Modules may add specialized workflows without making those records inaccessible to the core.

## Industry families

The module system must be able to support, over time:

1. Retail and fashion: footwear, clothing, accessories, watches, general merchandise.
2. Food, restaurants and hospitality.
3. Wholesale, distribution and trading.
4. Manufacturing and workshops.
5. Professional services and agencies.
6. Field services, repair and maintenance.
7. Healthcare and wellness.
8. Education and training.
9. Construction, property and trades.
10. Transport and logistics.
11. Agriculture and allied businesses.
12. Other configurable businesses.

These are capability families, not a promise that every specialized regulatory or vertical workflow ships at launch. Packs declare their own fields, statuses, screens and permissions, and are enabled per business.

## India-first requirements

- Store monetary amounts as integer minor units with an explicit currency code; default new Indian businesses to INR.
- Store timestamps in UTC and retain each business's IANA time zone for display and business-day rules.
- Capture state/UT as structured address data, not a hard-coded list of state-specific workflow branches.
- Keep GST identifiers and tax breakdowns explicit and extensible. Do not infer tax liability or treat AI output as tax advice.
- Support locale and language preferences at business and user level; never use translated display labels as persisted identifiers.
- Plan for intermittent connectivity on mobile, but do not claim offline writes until sync/conflict behavior is implemented.

## AI interaction principles

Voice and text should produce the same structured intent and use the same authorized domain operations. The assistant can prepare a proposed change, explain missing information, and request confirmation before consequential writes. Every write must be authorized server-side and attributable to a user; the model is not a security boundary.

## Initial scope

Build the repo foundation and shared contracts first. Then deliver a narrow end-to-end core workflow (for example a customer and a retail sale with payment) before expanding vertical coverage. Do not build all industry packs at once.

## Portfolio MVP slice

The first persisted web slice supports tenant setup, product/service catalog entries, and simple sales with paid/pending status. Guest visitors can browse fictional sample records and use a sample-only AI assistant; create actions return them to account setup. This demonstrates the universal tenancy and core-record pattern without claiming complete accounting, inventory valuation, customer management, or industry-specific compliance.
