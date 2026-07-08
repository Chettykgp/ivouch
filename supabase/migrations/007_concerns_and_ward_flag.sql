-- =============================================================================
-- Migration 007: community concerns (moderated negative signal),
-- vouch withdrawal, and in-ward / outside-ward flag on businesses.
-- =============================================================================

-- 1) In-ward flag: true = based in Ward 23, false = outside, null = unknown.
alter table businesses add column if not exists in_ward boolean;

-- 2) Concerns — structured, accountable (signed-in only), admin-moderated.
--    NOT publicly readable; only an admin-verified count is exposed.
create table if not exists concerns (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in (
    'no_show', 'poor_workmanship', 'overcharging', 'unprofessional', 'safety', 'other'
  )),
  details text,
  status text not null default 'open' check (status in ('open','reviewed','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

alter table concerns enable row level security;

create policy "users see own concerns" on concerns for select
  using (user_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "admins manage concerns" on concerns for all using (is_admin());

-- 3) RPC: raise a concern (must be signed in — accountability, no anonymous mud).
create or replace function public.submit_concern(
  p_business_id uuid,
  p_category text,
  p_details text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_id uuid;
begin
  select id into v_profile from profiles where auth_user_id = auth.uid();
  if v_profile is null then
    raise exception 'You must be signed in to raise a concern';
  end if;

  insert into concerns (business_id, user_id, category, details, status)
  values (p_business_id, v_profile, p_category, nullif(btrim(p_details), ''), 'open')
  on conflict (business_id, user_id)
  do update set category = excluded.category, details = excluded.details, status = 'open'
  returning id into v_id;

  return v_id;
end;
$$;
grant execute on function public.submit_concern(uuid, text, text) to authenticated;

-- 4) Public signal: count of ADMIN-VERIFIED (status='reviewed') concerns only.
create or replace function public.get_concern_count(p_business_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from concerns
  where business_id = p_business_id and status = 'reviewed';
$$;
grant execute on function public.get_concern_count(uuid) to anon, authenticated;

-- 5) Vouch withdrawal — trust can go down. Users may delete their own vouch.
drop policy if exists "users delete own vouches" on vouches;
create policy "users delete own vouches" on vouches for delete
  using (user_id in (select id from profiles where auth_user_id = auth.uid()));

-- 6) submit_business now captures the in-ward answer.
drop function if exists public.submit_business(text,text,text,uuid,text,text,text,text);
create or replace function public.submit_business(
  p_name text,
  p_slug text,
  p_description text,
  p_category_id uuid,
  p_phone text,
  p_whatsapp text,
  p_website text,
  p_address text,
  p_in_ward boolean default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_ward uuid;
begin
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Business name is required';
  end if;

  insert into businesses (
    name, slug, description, primary_category_id, phone, whatsapp, website,
    address_text, status, is_community_sourced, created_by_user_id, in_ward
  ) values (
    btrim(p_name), p_slug, nullif(btrim(p_description), ''), p_category_id,
    nullif(btrim(p_phone), ''), nullif(btrim(p_whatsapp), ''),
    nullif(btrim(p_website), ''), nullif(btrim(p_address), ''),
    'pending', true,
    (select id from profiles where auth_user_id = auth.uid()),
    p_in_ward
  )
  returning id into v_id;

  select id into v_ward from communities where slug = 'jhb-south-ward-23';
  if v_ward is not null then
    insert into business_communities (business_id, community_id)
    values (v_id, v_ward) on conflict do nothing;
  end if;

  return v_id;
end;
$$;
grant execute on function public.submit_business(text,text,text,uuid,text,text,text,text,boolean)
  to anon, authenticated;

-- 7) The Guy List came from the Ward 23 community list — mark those in-ward.
update businesses set in_ward = true where is_community_sourced = true and in_ward is null;
