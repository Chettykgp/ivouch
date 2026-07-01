-- Seed: Johannesburg Ward 23 and its child suburbs/aliases
-- Idempotent: uses ON CONFLICT DO NOTHING / DO UPDATE

-- Ward 23 parent record
insert into communities (name, slug, display_name, type, ward_number, municipality, municipality_code, province, country, source_name, source_date, description, status)
values (
  'Johannesburg Ward 23',
  'johannesburg-ward-23',
  'Ward 23 — Glenvista, Bassonia, Mulbarton',
  'ward',
  23,
  'City of Johannesburg Metropolitan Municipality',
  'JHB',
  'Gauteng',
  'South Africa',
  'Municipal Demarcation Board / Manual curation',
  '2026-07-01',
  'Ward 23 covers Glenvista, Bassonia, Mulbarton, Glenanda, Liefde en Vrede, Mayfield Park, Rispark, and South View in the south of Johannesburg.',
  'active'
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  type = excluded.type,
  ward_number = excluded.ward_number,
  municipality = excluded.municipality,
  updated_at = now();

-- Child suburbs — parent = Ward 23
with ward23 as (select id from communities where slug = 'johannesburg-ward-23')
insert into communities (name, slug, display_name, type, parent_community_id, municipality, province, country, status, description)
values
  ('Glenvista',       'glenvista',       'Glenvista',       'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Quiet, leafy suburb in the south of Johannesburg.'),
  ('Bassonia',        'bassonia',        'Bassonia',        'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Family-friendly suburb adjacent to Glenvista.'),
  ('Mulbarton',       'mulbarton',       'Mulbarton',       'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Established suburb in Johannesburg South.'),
  ('Glenanda',        'glenanda',        'Glenanda',        'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Residential suburb in Ward 23.'),
  ('Liefde en Vrede', 'liefde-en-vrede', 'Liefde en Vrede', 'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Suburb in Ward 23.'),
  ('Mayfield Park',   'mayfield-park',   'Mayfield Park',   'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Suburb in Ward 23.'),
  ('Rispark',         'rispark',         'Rispark',         'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Suburb in Ward 23.'),
  ('South View',      'south-view',      'South View',      'suburb', (select id from ward23), 'City of Johannesburg Metropolitan Municipality', 'Gauteng', 'South Africa', 'active', 'Suburb in Ward 23.')
on conflict (slug) do update set
  parent_community_id = excluded.parent_community_id,
  type = excluded.type,
  updated_at = now();

-- Aliases for Ward 23
with ward23 as (select id from communities where slug = 'johannesburg-ward-23')
insert into community_aliases (community_id, alias_name, alias_slug, alias_type, confidence, source_name)
values
  ((select id from ward23), 'Glenvista',       'glenvista',       'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Bassonia',        'bassonia',        'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Mulbarton',       'mulbarton',       'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Glenanda',        'glenanda',        'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Liefde en Vrede', 'liefde-en-vrede', 'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Mayfield Park',   'mayfield-park',   'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Rispark',         'rispark',         'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'South View',      'south-view',      'suburb',     'manual',   'Local knowledge / SPWard list May 2026'),
  ((select id from ward23), 'Ward 23',         'ward-23',         'ward_label', 'official', 'Municipal Demarcation Board'),
  ((select id from ward23), 'JHB Ward 23',     'jhb-ward-23',     'ward_label', 'manual',   'Common usage')
on conflict (community_id, alias_slug) do nothing;
