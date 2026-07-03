-- =============================================================================
-- Migration 005: allow public (anon + authenticated) community submissions,
-- while keeping everything gated to a moderated "pending" state.
-- =============================================================================

-- BUSINESSES: anyone can suggest a listing, but only as pending (never active)
drop policy if exists "authenticated submit business" on businesses;
create policy "public suggest pending business" on businesses
  for insert to anon, authenticated
  with check (status = 'pending');

-- BUSINESS_COMMUNITIES: allow linking a freshly-suggested (pending) business
-- to communities. Once approved (active) further public links are blocked.
create policy "public link pending business communities" on business_communities
  for insert to anon, authenticated
  with check (
    exists (select 1 from businesses b where b.id = business_id and b.status = 'pending')
  );

-- CLAIMS: anyone can submit a claim; it lands as pending for admin review.
drop policy if exists "authenticated submit claim" on claims;
create policy "public submit claim" on claims
  for insert to anon, authenticated
  with check (status = 'pending');

-- REPORTS: anyone can report content; it lands as open for admin review.
drop policy if exists "authenticated submit report" on reports;
create policy "public submit report" on reports
  for insert to anon, authenticated
  with check (status = 'open');
