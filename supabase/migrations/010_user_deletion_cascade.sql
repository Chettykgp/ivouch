-- Allow admins to hard-delete a user (removed from the ward) cleanly.
-- Deleting auth.users cascades to profiles; these FKs must not block that.
-- Businesses are kept (just unlinked); the user's own claims/reports go away.

alter table businesses drop constraint if exists businesses_created_by_user_id_fkey;
alter table businesses add constraint businesses_created_by_user_id_fkey
  foreign key (created_by_user_id) references profiles(id) on delete set null;

alter table businesses drop constraint if exists businesses_owner_user_id_fkey;
alter table businesses add constraint businesses_owner_user_id_fkey
  foreign key (owner_user_id) references profiles(id) on delete set null;

alter table claims drop constraint if exists claims_claimant_user_id_fkey;
alter table claims add constraint claims_claimant_user_id_fkey
  foreign key (claimant_user_id) references profiles(id) on delete cascade;

alter table claims drop constraint if exists claims_reviewed_by_fkey;
alter table claims add constraint claims_reviewed_by_fkey
  foreign key (reviewed_by) references profiles(id) on delete set null;

alter table reports drop constraint if exists reports_reported_by_user_id_fkey;
alter table reports add constraint reports_reported_by_user_id_fkey
  foreign key (reported_by_user_id) references profiles(id) on delete cascade;
