-- Migration 003: Ward-aware community model
-- Adds ward/suburb hierarchy, aliases, boundaries, user memberships, business service areas

-- Extend communities table with new columns (all IF NOT EXISTS to be safe)
alter table communities
  add column if not exists type text not null default 'suburb'
    check (type in ('ward','suburb','region','city','custom')),
  add column if not exists display_name text,
  add column if not exists municipality text,
  add column if not exists municipality_code text,
  add column if not exists country text not null default 'South Africa',
  add column if not exists ward_number integer,
  add column if not exists region_code text,
  add column if not exists parent_community_id uuid references communities(id),
  add column if not exists boundary_version text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_date date;

-- community_aliases: alternate names/slugs for communities (suburbs, townships, common names, etc.)
create table if not exists community_aliases (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  alias_name text not null,
  alias_slug text not null,
  alias_type text not null default 'suburb'
    check (alias_type in ('suburb','township','estate','neighbourhood','common_name','ward_label','region_label')),
  confidence text not null default 'manual'
    check (confidence in ('official','imported','manual','inferred')),
  source_name text,
  source_url text,
  created_at timestamptz not null default now(),
  unique(community_id, alias_slug)
);

-- community_boundaries: GeoJSON polygon/bbox storage
create table if not exists community_boundaries (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  boundary_type text not null default 'polygon',
  source_name text,
  source_url text,
  source_date date,
  boundary_version text,
  geojson jsonb,
  bbox jsonb,
  imported_at timestamptz not null default now()
);

-- user_communities: how users relate to communities (lives, works, serves, follows, owns business)
create table if not exists user_communities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  membership_type text not null default 'follows'
    check (membership_type in ('lives_here','works_here','serves_here','follows','owns_business_here')),
  is_primary boolean not null default false,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  unique(user_id, community_id)
);

-- business_service_areas: additive to business_communities; supports richer relationship types
create table if not exists business_service_areas (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  relationship text not null default 'serves'
    check (relationship in ('based_in','serves','delivers_to','available_in')),
  created_at timestamptz not null default now(),
  unique(business_id, community_id)
);

-- Indexes for common lookups
create index if not exists idx_communities_type on communities(type);
create index if not exists idx_communities_parent on communities(parent_community_id);
create index if not exists idx_communities_ward_number on communities(ward_number);
create index if not exists idx_community_aliases_community on community_aliases(community_id);
create index if not exists idx_community_aliases_slug on community_aliases(alias_slug);
create index if not exists idx_community_boundaries_community on community_boundaries(community_id);
create index if not exists idx_user_communities_user on user_communities(user_id);
create index if not exists idx_user_communities_community on user_communities(community_id);
create index if not exists idx_business_service_areas_business on business_service_areas(business_id);
create index if not exists idx_business_service_areas_community on business_service_areas(community_id);

-- RLS
alter table community_aliases enable row level security;
alter table community_boundaries enable row level security;
alter table user_communities enable row level security;
alter table business_service_areas enable row level security;

create policy "public read community aliases" on community_aliases for select using (true);
create policy "admins manage aliases" on community_aliases for all using (is_admin());

create policy "public read community boundaries" on community_boundaries for select using (true);
create policy "admins manage boundaries" on community_boundaries for all using (is_admin());

create policy "users read own community memberships" on user_communities for select
  using (user_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "users manage own community memberships" on user_communities for insert
  with check (user_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "users delete own community memberships" on user_communities for delete
  using (user_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "admins manage user communities" on user_communities for all using (is_admin());

create policy "public read business service areas" on business_service_areas for select using (true);
create policy "admins manage business service areas" on business_service_areas for all using (is_admin());
