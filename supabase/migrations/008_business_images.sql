-- =============================================================================
-- Migration 008: business photos (up to 2 per business) + storage bucket
-- =============================================================================

-- Up to 2 photo URLs per business (order = display order).
alter table businesses add column if not exists images text[] not null default '{}';

-- Public storage bucket for business photos. Public read via
-- /storage/v1/object/public/business-images/... . Uploads are performed
-- server-side with the service role, so no extra object policies are needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-images',
  'business-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];
