-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Communities
create table communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  city text not null default 'Johannesburg',
  province text not null default 'Gauteng',
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  email text,
  phone text,
  home_community_id uuid references communities(id),
  role text not null default 'user' check (role in ('user', 'admin', 'business_owner', 'community_champion')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Businesses
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  primary_category_id uuid references categories(id),
  phone text,
  whatsapp text,
  email text,
  website text,
  address_text text,
  owner_user_id uuid references profiles(id),
  claimed_status boolean not null default false,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'phone_verified', 'verified')),
  status text not null default 'pending' check (status in ('pending', 'active', 'hidden', 'rejected')),
  created_by_user_id uuid references profiles(id),
  is_community_sourced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Business <-> Community (many-to-many)
create table business_communities (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  unique(business_id, community_id)
);

-- Business <-> Category (many-to-many)
create table business_categories (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  unique(business_id, category_id)
);

-- Vouches
create table vouches (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  community_id uuid not null references communities(id),
  service_category_id uuid references categories(id),
  comment text,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'pending', 'hidden', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id, user_id)
);

-- Claims
create table claims (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  claimant_user_id uuid references profiles(id),
  claimant_name text not null,
  claimant_email text not null,
  claimant_phone text not null,
  evidence_text text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reports
create table reports (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null check (target_type in ('business', 'vouch', 'claim')),
  target_id uuid not null,
  reported_by_user_id uuid references profiles(id),
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger communities_updated_at before update on communities for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger businesses_updated_at before update on businesses for each row execute function update_updated_at();
create trigger vouches_updated_at before update on vouches for each row execute function update_updated_at();

-- Vouch count view
create or replace view business_vouch_counts as
select
  b.id as business_id,
  b.name,
  b.slug,
  count(v.id) filter (where v.status = 'active') as total_vouches
from businesses b
left join vouches v on v.business_id = b.id
group by b.id, b.name, b.slug;

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (auth_user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
