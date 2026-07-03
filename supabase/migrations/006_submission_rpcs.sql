-- =============================================================================
-- Migration 006: SECURITY DEFINER RPCs for public submissions.
-- These run server-side with controlled logic (always pending/open, always
-- linked to the profile of the caller if signed in) so the public forms work
-- reliably regardless of table-level RLS.
-- =============================================================================

-- Submit / suggest a business (always pending, community-sourced) + link ward.
create or replace function public.submit_business(
  p_name text,
  p_slug text,
  p_description text,
  p_category_id uuid,
  p_phone text,
  p_whatsapp text,
  p_website text,
  p_address text
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
    address_text, status, is_community_sourced, created_by_user_id
  ) values (
    btrim(p_name),
    p_slug,
    nullif(btrim(p_description), ''),
    p_category_id,
    nullif(btrim(p_phone), ''),
    nullif(btrim(p_whatsapp), ''),
    nullif(btrim(p_website), ''),
    nullif(btrim(p_address), ''),
    'pending',
    true,
    (select id from profiles where auth_user_id = auth.uid())
  )
  returning id into v_id;

  select id into v_ward from communities where slug = 'jhb-south-ward-23';
  if v_ward is not null then
    insert into business_communities (business_id, community_id)
    values (v_id, v_ward)
    on conflict do nothing;
  end if;

  return v_id;
end;
$$;

grant execute on function public.submit_business(text,text,text,uuid,text,text,text,text)
  to anon, authenticated;

-- Submit a claim on a business (always pending).
create or replace function public.submit_claim(
  p_business_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_evidence text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into claims (
    business_id, claimant_user_id, claimant_name, claimant_email,
    claimant_phone, evidence_text, status
  ) values (
    p_business_id,
    (select id from profiles where auth_user_id = auth.uid()),
    btrim(p_name),
    btrim(p_email),
    btrim(p_phone),
    nullif(btrim(p_evidence), ''),
    'pending'
  )
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.submit_claim(uuid,text,text,text,text)
  to anon, authenticated;

-- Submit a report on content (always open).
create or replace function public.submit_report(
  p_target_type text,
  p_target_id uuid,
  p_reason text,
  p_details text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into reports (
    target_type, target_id, reported_by_user_id, reason, details, status
  ) values (
    p_target_type,
    p_target_id,
    (select id from profiles where auth_user_id = auth.uid()),
    p_reason,
    nullif(btrim(p_details), ''),
    'open'
  )
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.submit_report(text,uuid,text,text)
  to anon, authenticated;
