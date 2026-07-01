-- =============================================================================
-- Migration 004: JHB South Ward 23 rebrand + comprehensive category taxonomy
-- =============================================================================

-- ── PART 1: Rebrand to "JHB South Ward 23" as a single consolidated community ──

update communities
set name         = 'JHB South Ward 23',
    slug         = 'jhb-south-ward-23',
    display_name = 'JHB South · Ward 23',
    description  = 'One community for Ward 23 in the south of Johannesburg — Glenvista, Bassonia, Mulbarton, Glenanda, Liefde en Vrede, Mayfield Park, Rispark and South View. We are neighbours, not separate suburbs.',
    updated_at   = now()
where slug = 'johannesburg-ward-23';

-- Keep the old slug working as a ward alias
with w as (select id from communities where slug = 'jhb-south-ward-23')
insert into community_aliases (community_id, alias_name, alias_slug, alias_type, confidence, source_name)
values ((select id from w), 'Johannesburg Ward 23', 'johannesburg-ward-23', 'ward_label', 'official', 'Municipal Demarcation Board')
on conflict (community_id, alias_slug) do nothing;

-- Consolidate: the surrounding areas are NOT separate browse destinations.
-- They live on as aliases of the one ward community. Deactivate standalone
-- suburb/area communities so we present a single unified community.
update communities
set status = 'inactive', updated_at = now()
where slug in (
  'glenvista','bassonia','mulbarton','glenanda','liefde-en-vrede',
  'mayfield-park','rispark','south-view','mondeor','lenasia','alberton'
);

-- Make sure every SPWard business is linked to the ward community
insert into business_communities (business_id, community_id)
select b.id, (select id from communities where slug = 'jhb-south-ward-23')
from businesses b
where b.is_community_sourced = true
on conflict (business_id, community_id) do nothing;


-- ── PART 2: Category taxonomy — add grouping columns ──────────────────────────

alter table categories
  add column if not exists group_name  text,
  add column if not exists sort_order  integer not null default 100,
  add column if not exists is_featured boolean not null default false;


-- ── PART 3: Merge duplicate categories into canonical ones ────────────────────

-- helper: repoint a business's primary + secondary category, then remove the dup
do $$
declare
  m record;
begin
  for m in
    select * from (values
      ('alterations',        'tailoring'),
      ('catering',           'catering-baking'),
      ('driving-instructor', 'driving-school'),
      ('photographer',       'photography'),
      ('tutor',              'tutoring')
    ) as t(from_slug, to_slug)
  loop
    -- primary category on businesses
    update businesses
      set primary_category_id = (select id from categories where slug = m.to_slug)
      where primary_category_id = (select id from categories where slug = m.from_slug);

    -- many-to-many business_categories (guard against unique-constraint clashes)
    delete from business_categories bc
      where bc.category_id = (select id from categories where slug = m.from_slug)
        and exists (
          select 1 from business_categories bc2
          where bc2.business_id = bc.business_id
            and bc2.category_id = (select id from categories where slug = m.to_slug)
        );
    update business_categories
      set category_id = (select id from categories where slug = m.to_slug)
      where category_id = (select id from categories where slug = m.from_slug);

    -- vouches service category
    update vouches
      set service_category_id = (select id from categories where slug = m.to_slug)
      where service_category_id = (select id from categories where slug = m.from_slug);

    -- remove the now-empty duplicate
    delete from categories where slug = m.from_slug;
  end loop;
end $$;


-- ── PART 4: Organize existing categories into groups (canonical names/icons) ───

update categories set group_name = 'Home & Maintenance',      sort_order = 10,  is_featured = true  where slug = 'plumber';
update categories set group_name = 'Home & Maintenance',      sort_order = 20,  is_featured = true  where slug = 'electrician';
update categories set group_name = 'Home & Maintenance',      sort_order = 30,  is_featured = true  where slug = 'handyman';
update categories set group_name = 'Home & Maintenance',      sort_order = 40,  is_featured = true  where slug = 'painter';
update categories set group_name = 'Home & Maintenance',      sort_order = 50                       where slug = 'construction';
update categories set group_name = 'Home & Maintenance',      sort_order = 60                       where slug = 'bricklaying';
update categories set group_name = 'Home & Maintenance',      sort_order = 70                       where slug = 'tiler';
update categories set group_name = 'Home & Maintenance',      sort_order = 80                       where slug = 'carpentry';
update categories set group_name = 'Home & Maintenance',      sort_order = 90                       where slug = 'roof-repair';
update categories set group_name = 'Home & Maintenance',      sort_order = 100                      where slug = 'waterproofing';
update categories set group_name = 'Home & Maintenance',      sort_order = 110                      where slug = 'ceilings';
update categories set group_name = 'Home & Maintenance',      sort_order = 120                      where slug = 'gutters';
update categories set group_name = 'Home & Maintenance',      sort_order = 130                      where slug = 'kitchens-cupboards';
update categories set group_name = 'Home & Maintenance',      sort_order = 140                      where slug = 'aluminium-glass';

update categories set group_name = 'Security & Access',       sort_order = 10                       where slug = 'electric-fencing';
update categories set group_name = 'Security & Access',       sort_order = 20                       where slug = 'security';
update categories set group_name = 'Security & Access',       sort_order = 30                       where slug = 'gate-garage-motors';
update categories set group_name = 'Security & Access',       sort_order = 40                       where slug = 'locksmith';

update categories set group_name = 'Appliances & Electronics', sort_order = 10                      where slug = 'appliance-repairs';
update categories set group_name = 'Appliances & Electronics', sort_order = 20                      where slug = 'dstv-installation';
update categories set group_name = 'Appliances & Electronics', sort_order = 30                      where slug = 'dish-tech';
update categories set group_name = 'Appliances & Electronics', sort_order = 40                      where slug = 'solar-gas';
update categories set group_name = 'Appliances & Electronics', sort_order = 50                      where slug = 'gas-installation';

update categories set group_name = 'Garden & Outdoor',        sort_order = 10,  is_featured = true  where slug = 'gardener';
update categories set group_name = 'Garden & Outdoor',        sort_order = 20                       where slug = 'tree-felling';
update categories set group_name = 'Garden & Outdoor',        sort_order = 30                       where slug = 'pool-service';
update categories set group_name = 'Garden & Outdoor',        sort_order = 40                       where slug = 'lapa-outdoor';
update categories set group_name = 'Garden & Outdoor',        sort_order = 50                       where slug = 'pest-control';
update categories set group_name = 'Garden & Outdoor',        sort_order = 60                       where slug = 'snake-catching';
update categories set group_name = 'Garden & Outdoor',        sort_order = 70                       where slug = 'composting-hardware';

update categories set group_name = 'Cleaning & Domestic',     sort_order = 10                       where slug = 'domestic-worker';
update categories set group_name = 'Cleaning & Domestic',     sort_order = 20                       where slug = 'mattress-cleaning';

update categories set group_name = 'Motoring & Transport',    sort_order = 10                       where slug = 'mechanic';
update categories set group_name = 'Motoring & Transport',    sort_order = 20                       where slug = 'transport-lifts';
update categories set group_name = 'Motoring & Transport',    sort_order = 30                       where slug = 'driving-school';
update categories set group_name = 'Motoring & Transport',    sort_order = 40                       where slug = 'license-registration';

update categories set group_name = 'Health & Medical',        sort_order = 10                       where slug = 'medical';
update categories set group_name = 'Health & Medical',        sort_order = 20                       where slug = 'dentist';
update categories set group_name = 'Health & Medical',        sort_order = 30                       where slug = 'orthodontist';
update categories set group_name = 'Health & Medical',        sort_order = 40                       where slug = 'eye-specialist';
update categories set group_name = 'Health & Medical',        sort_order = 50                       where slug = 'doula-postnatal';
update categories set group_name = 'Health & Medical',        sort_order = 60                       where slug = 'first-aid';

update categories set group_name = 'Beauty & Wellness',       sort_order = 10,  is_featured = true  where slug = 'hair';
update categories set group_name = 'Beauty & Wellness',       sort_order = 20                       where slug = 'nails-beauty';
update categories set group_name = 'Beauty & Wellness',       sort_order = 30                       where slug = 'massage-laser';
update categories set group_name = 'Beauty & Wellness',       sort_order = 40                       where slug = 'yoga-fitness';
update categories set group_name = 'Beauty & Wellness',       sort_order = 50                       where slug = 'wellness';

update categories set group_name = 'Food & Catering',         sort_order = 10                       where slug = 'catering-baking';
update categories set group_name = 'Food & Catering',         sort_order = 20                       where slug = 'coffee-shop';
update categories set group_name = 'Food & Catering',         sort_order = 30                       where slug = 'restaurants';
update categories set group_name = 'Food & Catering',         sort_order = 40                       where slug = 'butcher';

update categories set group_name = 'Education & Kids',        sort_order = 10,  is_featured = true  where slug = 'tutoring';
update categories set group_name = 'Education & Kids',        sort_order = 20                       where slug = 'swimming-lessons';
update categories set group_name = 'Education & Kids',        sort_order = 30                       where slug = 'baby-mommy';

update categories set group_name = 'Pets & Animals',          sort_order = 10                       where slug = 'vet';
update categories set group_name = 'Pets & Animals',          sort_order = 20                       where slug = 'dog-training';
update categories set group_name = 'Pets & Animals',          sort_order = 30                       where slug = 'bird-specialist';

update categories set group_name = 'Events & Creative',       sort_order = 10                       where slug = 'photography';
update categories set group_name = 'Events & Creative',       sort_order = 20                       where slug = 'dj';
update categories set group_name = 'Events & Creative',       sort_order = 30                       where slug = 'jumping-castles';
update categories set group_name = 'Events & Creative',       sort_order = 40                       where slug = 'chair-hire';
update categories set group_name = 'Events & Creative',       sort_order = 50                       where slug = 'printing-signage';
update categories set group_name = 'Events & Creative',       sort_order = 60                       where slug = '3d-printing';
update categories set group_name = 'Events & Creative',       sort_order = 70                       where slug = 'gifting-embroidery';

update categories set group_name = 'Professional & Business', sort_order = 10                       where slug = 'labour-law';

update categories set group_name = 'Fashion & Repairs',       sort_order = 10                       where slug = 'tailoring';
update categories set group_name = 'Fashion & Repairs',       sort_order = 20                       where slug = 'shoe-repairs';


-- ── PART 5: Add missing categories for a comprehensive, useful taxonomy ────────

insert into categories (name, slug, icon, description, group_name, sort_order, is_featured, status) values
  -- Home & Maintenance
  ('Tiling & Paving',        'paving',            '🧱', 'Paving, driveways and outdoor tiling',            'Home & Maintenance', 75,  false, 'active'),
  ('Welding & Steelwork',    'welding',           '🔩', 'Welding, gates, burglar bars and steelwork',      'Home & Maintenance', 145, false, 'active'),
  ('Flooring',               'flooring',          '🪵', 'Wooden, laminate and vinyl flooring',             'Home & Maintenance', 150, false, 'active'),
  ('Blinds & Curtains',      'blinds-curtains',   '🪟', 'Blinds, curtains and window treatments',          'Home & Maintenance', 160, false, 'active'),
  ('Damp & Pest Proofing',   'damp-proofing',     '💧', 'Rising damp and moisture control',                'Home & Maintenance', 170, false, 'active'),
  -- Security & Access
  ('CCTV & Alarms',          'cctv-alarms',       '📹', 'CCTV cameras, alarms and monitoring',             'Security & Access', 25, true, 'active'),
  ('Armed Response',         'armed-response',    '🛡️', 'Armed response and guarding services',             'Security & Access', 35, false, 'active'),
  -- Appliances & Electronics
  ('Computer & IT Repairs',  'it-repairs',        '💻', 'Computer, laptop and network repairs',            'Appliances & Electronics', 60, false, 'active'),
  ('Cellphone Repairs',      'cellphone-repairs', '📱', 'Cellphone and tablet screen repairs',             'Appliances & Electronics', 70, false, 'active'),
  ('Solar & Inverters',      'solar-inverters',   '🔋', 'Solar panels, batteries and inverter installs',   'Appliances & Electronics', 45, true, 'active'),
  -- Garden & Outdoor
  ('Landscaping',            'landscaping',       '🌳', 'Landscape design and garden makeovers',           'Garden & Outdoor', 15, false, 'active'),
  ('Irrigation',             'irrigation',        '💦', 'Sprinkler systems and borehole services',         'Garden & Outdoor', 45, false, 'active'),
  -- Cleaning & Domestic
  ('Cleaning Services',      'cleaning-services', '🧽', 'Home, office and deep cleaning',                  'Cleaning & Domestic', 5,  true,  'active'),
  ('Window Cleaning',        'window-cleaning',   '🪟', 'Window and gutter cleaning',                      'Cleaning & Domestic', 30, false, 'active'),
  ('Laundry & Dry Cleaning', 'laundry',           '🧺', 'Laundry, ironing and dry cleaning',               'Cleaning & Domestic', 40, false, 'active'),
  ('Refuse & Rubble Removal','rubble-removal',    '🗑️', 'Garden refuse and building rubble removal',        'Cleaning & Domestic', 50, false, 'active'),
  -- Motoring & Transport
  ('Auto Electrician',       'auto-electrician',  '🔌', 'Vehicle electrical and diagnostics',              'Motoring & Transport', 15, false, 'active'),
  ('Panel Beater',           'panel-beater',      '🚙', 'Panel beating and spray painting',                'Motoring & Transport', 20, false, 'active'),
  ('Tyres & Wheels',         'tyres',             '🛞', 'Tyres, alignment and balancing',                  'Motoring & Transport', 25, false, 'active'),
  ('Car Wash & Valet',       'car-wash',          '🚿', 'Car wash, valet and detailing',                   'Motoring & Transport', 35, false, 'active'),
  ('Towing & Roadside',      'towing',            '🚛', 'Towing and roadside assistance',                  'Motoring & Transport', 45, false, 'active'),
  ('Moving Company',         'moving-company',    '📦', 'House and office moving',                          'Motoring & Transport', 50, false, 'active'),
  -- Health & Medical
  ('GP / Doctor',            'gp-doctor',         '🩺', 'General practitioners and family doctors',         'Health & Medical', 5,  true,  'active'),
  ('Physiotherapist',        'physiotherapist',   '🦴', 'Physiotherapy and rehabilitation',                'Health & Medical', 35, false, 'active'),
  ('Psychologist',           'psychologist',      '🧠', 'Counselling and mental health',                   'Health & Medical', 45, false, 'active'),
  ('Home Nursing',           'home-nursing',      '🏥', 'Home-based nursing and care',                     'Health & Medical', 55, false, 'active'),
  ('Pharmacy',               'pharmacy',          '💊', 'Pharmacies and dispensaries',                     'Health & Medical', 65, false, 'active'),
  -- Beauty & Wellness
  ('Beauty Salon',           'beauty-salon',      '💄', 'Facials, waxing and beauty treatments',           'Beauty & Wellness', 25, false, 'active'),
  ('Makeup Artist',          'makeup-artist',     '💋', 'Bridal and event makeup',                         'Beauty & Wellness', 35, false, 'active'),
  ('Personal Trainer',       'personal-trainer',  '🏋️', 'Personal training and fitness coaching',           'Beauty & Wellness', 45, false, 'active'),
  -- Food & Catering
  ('Home Cooked Meals',      'home-cooked-meals', '🍲', 'Home-cooked meals and meal prep',                 'Food & Catering', 15, false, 'active'),
  ('Private Chef',           'private-chef',      '👨‍🍳', 'Private chefs and in-home dining',                'Food & Catering', 25, false, 'active'),
  -- Education & Kids
  ('Music Lessons',          'music-lessons',     '🎹', 'Piano, guitar and music tuition',                 'Education & Kids', 40, false, 'active'),
  ('Day Care / Creche',      'day-care',          '🧸', 'Creches, day care and aftercare',                 'Education & Kids', 50, false, 'active'),
  ('Au Pair / Nanny',        'au-pair',           '👶', 'Au pairs, nannies and babysitters',               'Education & Kids', 60, false, 'active'),
  -- Pets & Animals
  ('Pet Grooming',           'pet-grooming',      '🐩', 'Dog and cat grooming',                            'Pets & Animals', 40, false, 'active'),
  ('Pet Sitting & Walking',  'pet-sitting',       '🦮', 'Pet sitting, boarding and dog walking',           'Pets & Animals', 50, false, 'active'),
  -- Events & Creative
  ('Videographer',           'videographer',      '🎥', 'Event and promotional videography',               'Events & Creative', 15, false, 'active'),
  ('Event Planning',         'event-planning',    '🎉', 'Event coordination and decor',                    'Events & Creative', 25, false, 'active'),
  ('Florist',                'florist',           '💐', 'Flowers and floral arrangements',                 'Events & Creative', 35, false, 'active'),
  -- Professional & Business
  ('Accountant',             'accountant',        '📊', 'Accounting, tax and bookkeeping',                 'Professional & Business', 5,  true,  'active'),
  ('Attorney / Legal',       'attorney',          '⚖️', 'Attorneys and legal services',                     'Professional & Business', 15, false, 'active'),
  ('Financial Advisor',      'financial-advisor', '💰', 'Financial planning and advice',                   'Professional & Business', 20, false, 'active'),
  ('Insurance Broker',       'insurance',         '🛡️', 'Short-term and life insurance',                    'Professional & Business', 25, false, 'active'),
  ('Estate Agent',           'estate-agent',      '🏡', 'Property sales and rentals',                      'Professional & Business', 30, false, 'active'),
  ('Bond Originator',        'bond-originator',   '🏦', 'Home loans and bond origination',                 'Professional & Business', 35, false, 'active'),
  ('Graphic Design',         'graphic-design',    '🎨', 'Logos, branding and graphic design',              'Professional & Business', 40, false, 'active'),
  ('Web & App Development',   'web-development',   '🌐', 'Websites, apps and digital services',             'Professional & Business', 45, false, 'active'),
  ('Marketing & Social',     'marketing',         '📣', 'Marketing and social media management',           'Professional & Business', 50, false, 'active'),
  -- Fashion & Repairs
  ('Dry Cleaning',           'dry-cleaning',      '👔', 'Specialist dry cleaning',                         'Fashion & Repairs', 30, false, 'active'),
  ('Jewellery Repairs',      'jewellery-repairs', '💍', 'Jewellery repair and valuation',                  'Fashion & Repairs', 40, false, 'active')
on conflict (slug) do update set
  group_name  = excluded.group_name,
  sort_order  = excluded.sort_order,
  is_featured = excluded.is_featured;

-- Any category still without a group lands in "Other Services"
update categories set group_name = 'Other Services' where group_name is null;
