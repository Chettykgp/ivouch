-- 1) Persist the neighbourhood a voucher selects (was collected but dropped).
alter table vouches add column if not exists neighbourhood text;

-- 2) Owner "Say thanks" replies — one short public response per vouch,
--    written by the claimed owner (or admin) via a service-role server route.
alter table vouches add column if not exists owner_reply text;
alter table vouches add column if not exists owner_reply_at timestamptz;
