-- Communities (Johannesburg South / South Suburbs)
insert into communities (name, slug, city, province, description) values
  ('Glenvista', 'glenvista', 'Johannesburg', 'Gauteng', 'A quiet, leafy suburb in the south of Johannesburg.'),
  ('Bassonia', 'bassonia', 'Johannesburg', 'Gauteng', 'Family-friendly suburb adjacent to Glenvista.'),
  ('Mondeor', 'mondeor', 'Johannesburg', 'Gauteng', 'Long-established southern suburb of Johannesburg.'),
  ('Mulbarton', 'mulbarton', 'Johannesburg', 'Gauteng', 'Established suburb in Johannesburg South.'),
  ('Lenasia', 'lenasia', 'Johannesburg', 'Gauteng', 'Vibrant community in Johannesburg South.'),
  ('Alberton', 'alberton', 'Ekurhuleni', 'Gauteng', 'Large town on the East Rand, Ekurhuleni.');

-- Categories (20 total)
insert into categories (name, slug, icon, description) values
  ('Plumber', 'plumber', '🔧', 'Plumbing repairs and installations'),
  ('Electrician', 'electrician', '⚡', 'Electrical repairs and installations'),
  ('Mechanic', 'mechanic', '🔩', 'Vehicle repairs and maintenance'),
  ('Tutor', 'tutor', '📚', 'Academic tutoring and coaching'),
  ('Gardener', 'gardener', '🌿', 'Garden maintenance and landscaping'),
  ('Domestic Worker', 'domestic-worker', '🏠', 'Household cleaning and domestic services'),
  ('DJ', 'dj', '🎵', 'DJs for events and parties'),
  ('Photographer', 'photographer', '📷', 'Photography for events and portraits'),
  ('Painter', 'painter', '🎨', 'House painting and decorating'),
  ('Handyman', 'handyman', '🪛', 'General repairs and odd jobs'),
  ('Locksmith', 'locksmith', '🔑', 'Lock repairs and security'),
  ('Pest Control', 'pest-control', '🐜', 'Pest and rodent control'),
  ('Pool Service', 'pool-service', '🏊', 'Swimming pool cleaning and maintenance'),
  ('Security', 'security', '🔒', 'Armed response and security guarding'),
  ('Tiler', 'tiler', '⬛', 'Floor and wall tiling'),
  ('Tree Felling', 'tree-felling', '🌳', 'Tree removal and pruning'),
  ('Roof Repair', 'roof-repair', '🏗️', 'Roofing repairs and waterproofing'),
  ('Catering', 'catering', '🍽️', 'Event catering and food preparation'),
  ('Driving Instructor', 'driving-instructor', '🚗', 'Learner driver tuition'),
  ('Alterations & Tailoring', 'alterations', '🧵', 'Clothing alterations and dressmaking');

-- Sample businesses
with
  cat_plumber as (select id from categories where slug = 'plumber'),
  cat_electrician as (select id from categories where slug = 'electrician'),
  cat_mechanic as (select id from categories where slug = 'mechanic'),
  cat_gardener as (select id from categories where slug = 'gardener'),
  cat_painter as (select id from categories where slug = 'painter'),
  cat_handyman as (select id from categories where slug = 'handyman'),
  comm_glenvista as (select id from communities where slug = 'glenvista'),
  comm_bassonia as (select id from communities where slug = 'bassonia'),
  comm_mondeor as (select id from communities where slug = 'mondeor'),
  comm_mulbarton as (select id from communities where slug = 'mulbarton'),
  comm_lenasia as (select id from communities where slug = 'lenasia'),
  comm_alberton as (select id from communities where slug = 'alberton'),
  inserted_businesses as (
    insert into businesses (name, slug, description, primary_category_id, phone, whatsapp, status, is_community_sourced, verification_status, claimed_status)
    values
      ('Mike''s Plumbing & Gas', 'mikes-plumbing-and-gas',
       'Reliable plumbing and gas services across the south of Johannesburg. Available 24/7 for emergencies.',
       (select id from cat_plumber), '+27 11 432 1122', '+27 82 432 1122', 'active', true, 'phone_verified', true),

      ('FastFix Plumbers', 'fastfix-plumbers',
       'Affordable plumbing repairs and installations. No call-out fee within Glenvista and surrounds.',
       (select id from cat_plumber), '+27 11 555 7890', '+27 71 555 7890', 'active', true, 'unverified', false),

      ('Bright Spark Electrical', 'bright-spark-electrical',
       'Qualified electrician for residential and light commercial work. CoC certificates issued.',
       (select id from cat_electrician), '+27 11 888 2233', '+27 83 888 2233', 'active', true, 'verified', true),

      ('Power Up Electrical', 'power-up-electrical',
       'All electrical repairs, DB board upgrades, and solar installations.',
       (select id from cat_electrician), '+27 11 301 4455', '+27 79 301 4455', 'active', true, 'phone_verified', false),

      ('Johnny''s Auto Repairs', 'johnnys-auto-repairs',
       'Full mechanical workshop. Servicing all makes and models. Honest pricing.',
       (select id from cat_mechanic), '+27 11 612 9900', '+27 82 612 9900', 'active', true, 'verified', true),

      ('Green Thumb Gardens', 'green-thumb-gardens',
       'Regular garden maintenance, planting, pruning, and once-off clean-ups.',
       (select id from cat_gardener), '+27 11 234 5678', '+27 76 234 5678', 'active', true, 'unverified', false),

      ('ProPaint Interior & Exterior', 'propaint-interior-exterior',
       'Quality house painting services. Interior, exterior, and roof painting.',
       (select id from cat_painter), '+27 11 456 7890', '+27 81 456 7890', 'active', true, 'phone_verified', false),

      ('Handy Harry', 'handy-harry',
       'No job too small. Shelves, doors, taps, tiles, gutters — you name it.',
       (select id from cat_handyman), '+27 11 789 0123', '+27 84 789 0123', 'active', true, 'unverified', false)
    returning id, slug
  )
-- Business-Community links
insert into business_communities (business_id, community_id)
select b.id, c.id from inserted_businesses b, (
  select id from communities where slug in ('glenvista','bassonia','mondeor')
) c
where b.slug in ('mikes-plumbing-and-gas','bright-spark-electrical','johnnys-auto-repairs','propaint-interior-exterior','handy-harry')
union all
select b.id, c.id from inserted_businesses b, (
  select id from communities where slug in ('mulbarton','lenasia','alberton')
) c
where b.slug in ('fastfix-plumbers','power-up-electrical','green-thumb-gardens');

-- Seed vouches (we need profile IDs - these are placeholder inserts that will fail unless real auth users exist)
-- Run these manually after creating test accounts, or use the admin panel to add vouches.
-- Example (uncomment and replace UUIDs after creating users):
-- insert into vouches (business_id, user_id, community_id, tags, comment, status)
-- values (
--   (select id from businesses where slug = 'mikes-plumbing-and-gas'),
--   '<profile_id>',
--   (select id from communities where slug = 'glenvista'),
--   array['Reliable','Fair price','Professional'],
--   'Mike fixed our geyser within 2 hours of calling. Highly recommend!',
--   'active'
-- );
