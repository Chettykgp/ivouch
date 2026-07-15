-- Collect a contact email when a business is submitted.
-- businesses.email already exists (001) but submit_business never set it.

drop function if exists public.submit_business(text,text,text,uuid,text,text,text,text,boolean);
create or replace function public.submit_business(
  p_name text,
  p_slug text,
  p_description text,
  p_category_id uuid,
  p_phone text,
  p_whatsapp text,
  p_email text,
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
    name, slug, description, primary_category_id, phone, whatsapp, email, website,
    address_text, status, is_community_sourced, created_by_user_id, in_ward
  ) values (
    btrim(p_name), p_slug, nullif(btrim(p_description), ''), p_category_id,
    nullif(btrim(p_phone), ''), nullif(btrim(p_whatsapp), ''),
    nullif(lower(btrim(p_email)), ''),
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

grant execute on function public.submit_business(text,text,text,uuid,text,text,text,text,text,boolean)
  to anon, authenticated;
