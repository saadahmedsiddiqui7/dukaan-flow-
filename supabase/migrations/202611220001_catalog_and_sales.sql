-- Add the first durable business workflows without changing existing tenant data.
-- Every row is scoped by business_id and protected by membership-aware RLS.

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_type text not null default 'product' check (item_type in ('product', 'service')),
  name text not null check (length(trim(name)) between 1 and 160),
  category text not null default 'Other' check (length(trim(category)) between 1 and 120),
  sku text,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  unit text not null default 'item' check (length(trim(unit)) between 1 and 24),
  unit_price_minor bigint not null check (unit_price_minor > 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, sku)
);

create index catalog_items_business_created_idx
  on public.catalog_items (business_id, created_at desc);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null default 'Walk-in customer'
    check (length(trim(customer_name)) between 1 and 160),
  item_summary text not null check (length(trim(item_summary)) between 1 and 240),
  total_minor bigint not null check (total_minor > 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'paid' check (status in ('paid', 'pending')),
  occurred_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create index sales_business_occurred_idx
  on public.sales (business_id, occurred_at desc);

create or replace function public.catalog_items_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger catalog_items_set_updated_at
  before update on public.catalog_items
  for each row execute function public.catalog_items_set_updated_at();

alter table public.catalog_items enable row level security;
alter table public.sales enable row level security;

revoke all on table public.catalog_items, public.sales from public, anon;
grant select, insert, update on table public.catalog_items to authenticated;
grant select, insert on table public.sales to authenticated;

create policy "Members can read catalog items"
  on public.catalog_items for select to authenticated
  using (public.is_business_member(business_id));

create policy "Staff can add catalog items"
  on public.catalog_items for insert to authenticated
  with check (
    public.has_business_role(business_id, array['owner', 'admin', 'manager', 'staff'])
    and created_by = (select auth.uid())
  );

create policy "Staff can update catalog items"
  on public.catalog_items for update to authenticated
  using (public.has_business_role(business_id, array['owner', 'admin', 'manager', 'staff']))
  with check (public.has_business_role(business_id, array['owner', 'admin', 'manager', 'staff']));

create policy "Members can read sales"
  on public.sales for select to authenticated
  using (public.is_business_member(business_id));

create policy "Staff can record sales"
  on public.sales for insert to authenticated
  with check (
    public.has_business_role(business_id, array['owner', 'admin', 'manager', 'staff'])
    and created_by = (select auth.uid())
  );
