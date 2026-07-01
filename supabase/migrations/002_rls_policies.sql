-- Enable RLS
alter table communities enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_communities enable row level security;
alter table business_categories enable row level security;
alter table vouches enable row level security;
alter table claims enable row level security;
alter table reports enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- COMMUNITIES: public read active
create policy "public can read active communities" on communities for select using (status = 'active');
create policy "admins manage communities" on communities for all using (is_admin());

-- CATEGORIES: public read active
create policy "public can read active categories" on categories for select using (status = 'active');
create policy "admins manage categories" on categories for all using (is_admin());

-- PROFILES: users see own profile, admins see all
create policy "users see own profile" on profiles for select using (auth_user_id = auth.uid());
create policy "admins see all profiles" on profiles for select using (is_admin());
create policy "users update own profile" on profiles for update using (auth_user_id = auth.uid());
create policy "system insert profiles" on profiles for insert with check (auth_user_id = auth.uid());

-- BUSINESSES: public read active, authenticated submit, owners edit own
create policy "public read active businesses" on businesses for select using (status = 'active');
create policy "admins see all businesses" on businesses for select using (is_admin());
create policy "authenticated submit business" on businesses for insert with check (auth.uid() is not null);
create policy "owner edit own business" on businesses for update using (
  owner_user_id in (select id from profiles where auth_user_id = auth.uid())
  and claimed_status = true
);
create policy "admins manage businesses" on businesses for all using (is_admin());

-- BUSINESS_COMMUNITIES: public read
create policy "public read business communities" on business_communities for select using (true);
create policy "admins manage business communities" on business_communities for all using (is_admin());

-- BUSINESS_CATEGORIES: public read
create policy "public read business categories" on business_categories for select using (true);
create policy "admins manage business categories" on business_categories for all using (is_admin());

-- VOUCHES: public read active, authenticated create, users manage own
create policy "public read active vouches" on vouches for select using (status = 'active');
create policy "admins see all vouches" on vouches for select using (is_admin());
create policy "authenticated create vouch" on vouches for insert with check (
  auth.uid() is not null
  and user_id in (select id from profiles where auth_user_id = auth.uid())
);
create policy "users manage own vouches" on vouches for update using (
  user_id in (select id from profiles where auth_user_id = auth.uid())
);
create policy "admins manage vouches" on vouches for all using (is_admin());

-- CLAIMS: authenticated submit, admins manage
create policy "authenticated submit claim" on claims for insert with check (auth.uid() is not null);
create policy "admins manage claims" on claims for all using (is_admin());

-- REPORTS: authenticated submit, admins manage
create policy "authenticated submit report" on reports for insert with check (auth.uid() is not null);
create policy "admins manage reports" on reports for all using (is_admin());
