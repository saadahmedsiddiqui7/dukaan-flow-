-- New-install foundation only. Additive and intentionally limited to tenancy
-- and module registration; business data workflows will arrive in later migrations.
create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  default_currency text not null default 'INR' check (default_currency ~ '^[A-Z]{3}$'),
  time_zone text not null default 'Asia/Kolkata',
  locale text not null default 'en-IN',
  state_or_union_territory text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_memberships (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'manager', 'staff', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index business_memberships_user_id_idx on public.business_memberships(user_id);

create table public.industry_modules (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,62}$'),
  current_version integer not null check (current_version > 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table public.business_industry_modules (
  business_id uuid not null references public.businesses(id) on delete cascade,
  module_key text not null references public.industry_modules(key) on update cascade on delete restrict,
  module_version integer not null check (module_version > 0),
  enabled_at timestamptz not null default now(),
  configuration jsonb not null default '{}'::jsonb check (jsonb_typeof(configuration) = 'object'),
  primary key (business_id, module_key)
);

create index business_industry_modules_module_idx on public.business_industry_modules(module_key);

-- Enable RLS now; policies are explicit and deny access unless membership is proven.
alter table public.businesses enable row level security;
alter table public.business_memberships enable row level security;
alter table public.industry_modules enable row level security;
alter table public.business_industry_modules enable row level security;

-- SECURITY DEFINER membership helpers avoid recursive RLS when policies need to
-- inspect business_memberships itself. Their only input is the requested business;
-- identity always comes from the authenticated JWT.
create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.business_memberships m
    where m.business_id = p_business_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_business_role(p_business_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.business_memberships m
    where m.business_id = p_business_id
      and m.user_id = (select auth.uid()) and m.role = any(p_roles)
  );
$$;

revoke all on function public.is_business_member(uuid) from public, anon;
revoke all on function public.has_business_role(uuid, text[]) from public, anon;
grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.has_business_role(uuid, text[]) to authenticated;

create policy "Members can read their businesses" on public.businesses
  for select to authenticated
  using (public.is_business_member(id));

create policy "Owners and admins can update their businesses" on public.businesses
  for update to authenticated
  using (public.has_business_role(id, array['owner', 'admin']))
  with check (public.has_business_role(id, array['owner', 'admin']));

create policy "Members can read their memberships" on public.business_memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or public.has_business_role(business_id, array['owner', 'admin', 'manager']));

create policy "Authenticated users can read module catalog" on public.industry_modules
  for select to authenticated using (true);

create policy "Members can read enabled business modules" on public.business_industry_modules
  for select to authenticated
  using (public.is_business_member(business_id));

-- The first signed-in user can securely create their tenant without granting broad
-- direct INSERT rights on tenant tables. Membership creation is atomic with business
-- creation; later invitations and role changes remain server-side operations.
create or replace function public.create_business(
  p_name text,
  p_default_currency text default 'INR',
  p_time_zone text default 'Asia/Kolkata',
  p_locale text default 'en-IN',
  p_state_or_union_territory text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_name is null or length(trim(p_name)) not between 1 and 160 then
    raise exception 'Business name must contain 1 to 160 characters' using errcode = '22023';
  end if;

  insert into public.businesses (name, default_currency, time_zone, locale, state_or_union_territory)
  values (trim(p_name), coalesce(p_default_currency, 'INR'), coalesce(p_time_zone, 'Asia/Kolkata'), coalesce(p_locale, 'en-IN'), nullif(trim(p_state_or_union_territory), ''))
  returning id into v_business_id;

  insert into public.business_memberships (business_id, user_id, role)
  values (v_business_id, v_user_id, 'owner');

  return v_business_id;
end;
$$;

revoke all on function public.create_business(text, text, text, text, text) from public, anon;
grant execute on function public.create_business(text, text, text, text, text) to authenticated;

-- Module catalog changes, invitations and role changes remain server-side operations.
-- Never ship Supabase service credentials to either client.
