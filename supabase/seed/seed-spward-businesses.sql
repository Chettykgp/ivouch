-- =============================================================================
-- Seed: Ward 23 (Glenvista) "The Guy List" — May 2026
-- Source: SPWard community contact list, May 2026 update
-- Imported by: admin
-- Note: All businesses are community-sourced (is_community_sourced = true)
--       and set to status = 'pending' so admin can review before going live.
--       Phone numbers are as recorded in the community list.
-- =============================================================================

-- Ensure categories exist for SPWard entries (supplement existing seed)
insert into categories (name, slug, icon, description) values
  ('Waterproofing',        'waterproofing',       '💧', 'Waterproofing and damp-proofing services'),
  ('Gutters',              'gutters',              '🏠', 'Gutter installation and repairs'),
  ('Ceilings',             'ceilings',             '🔲', 'Ceiling repairs and installations'),
  ('Bricklaying',          'bricklaying',          '🧱', 'Bricklaying and masonry'),
  ('Carpentry',            'carpentry',            '🪚', 'Carpentry and woodwork'),
  ('Aluminium & Glass',    'aluminium-glass',      '🪟', 'Aluminium frames, glass and tinting'),
  ('Appliance Repairs',    'appliance-repairs',    '🔧', 'Household appliance repairs'),
  ('Gate & Garage Motors', 'gate-garage-motors',   '🚪', 'Gate motors and garage door repairs'),
  ('Electric Fencing',     'electric-fencing',     '⚡', 'Electric fence installation and repairs'),
  ('DSTV Installation',    'dstv-installation',    '📡', 'DSTV and satellite dish installation'),
  ('Pool Service',         'pool-service',         '🏊', 'Swimming pool cleaning and maintenance'),
  ('Solar & Gas',          'solar-gas',            '☀️', 'Solar systems and gas installations'),
  ('Pest Control',         'pest-control',         '🐛', 'Pest and rodent control'),
  ('Snake Catching',       'snake-catching',       '🐍', 'Snake removal and relocation'),
  ('Composting & Hardware','composting-hardware',  '🌱', 'Hardware and garden supplies'),
  ('Lapa & Outdoor',       'lapa-outdoor',         '🌳', 'Lapa repairs and outdoor structures'),
  ('Printing & Signage',   'printing-signage',     '🖨️', 'Printing, signage and branded items'),
  ('3D Printing',          '3d-printing',          '🖨️', '3D printing services'),
  ('Gifting & Embroidery', 'gifting-embroidery',   '🎁', 'Printed gifting and embroidery'),
  ('Catering & Baking',    'catering-baking',      '🎂', 'Bakers, caterers and home cooks'),
  ('Coffee Shop',          'coffee-shop',          '☕', 'Coffee shops and cafes'),
  ('Restaurants & Eateries','restaurants',         '🍽️', 'Restaurants and food eateries'),
  ('Yoga & Fitness',       'yoga-fitness',         '🧘', 'Yoga, fitness and wellness classes'),
  ('Nails & Beauty',       'nails-beauty',         '💅', 'Nail technicians and beauty services'),
  ('Hair',                 'hair',                 '✂️', 'Hairdressers and hair salons'),
  ('Massage & Laser',      'massage-laser',        '💆', 'Massage therapy and laser treatments'),
  ('Wellness',             'wellness',             '🌿', 'General wellness practitioners'),
  ('Tutoring',             'tutoring',             '📚', 'Academic tutoring and coaching'),
  ('Swimming Lessons',     'swimming-lessons',     '🏊', 'Swimming lessons for all ages'),
  ('Driving School',       'driving-school',       '🚗', 'Driving lessons and instructor'),
  ('Baby & Mommy Classes', 'baby-mommy',           '👶', 'Mommy and baby classes'),
  ('Dentist',              'dentist',              '🦷', 'Dental practitioners'),
  ('Eye Specialist',       'eye-specialist',       '👁️', 'Optometrists and eye specialists'),
  ('Medical',              'medical',              '🏥', 'General medical practitioners'),
  ('Doula & Post-Natal',   'doula-postnatal',      '🤱', 'Doula, midwife and post-natal support'),
  ('First Aid',            'first-aid',            '🩺', 'First aid courses and training'),
  ('Orthodontist',         'orthodontist',         '😁', 'Orthodontists and braces'),
  ('Vet',                  'vet',                  '🐾', 'Veterinarians and animal care'),
  ('Dog Training',         'dog-training',         '🐕', 'Dog training and obedience classes'),
  ('Bird Specialist',      'bird-specialist',      '🦜', 'Bird specialists and breeders'),
  ('Tailoring & Alterations','tailoring',          '🧵', 'Clothing alterations and tailoring'),
  ('Butcher',              'butcher',              '🥩', 'Butcheries and meat suppliers'),
  ('Shoe Repairs',         'shoe-repairs',         '👟', 'Shoe repair and cobbler'),
  ('Photography',          'photography',          '📷', 'Photographers for events and portraits'),
  ('Locksmith',            'locksmith',            '🔑', 'Locksmiths and lock services'),
  ('Gas Installation',     'gas-installation',     '🔥', 'Gas stove and appliance installation'),
  ('Mattress Cleaning',    'mattress-cleaning',    '🛏️', 'Mattress and upholstery cleaning'),
  ('Jumping Castles',      'jumping-castles',      '🎪', 'Jumping castle hire for events'),
  ('Chair Hire',           'chair-hire',           '🪑', 'Chair and event equipment hire'),
  ('Dish Tech & Satellites','dish-tech',           '📡', 'Satellite dish and TV installation'),
  ('Transport & Lifts',    'transport-lifts',      '🚗', 'Transport and lift club services'),
  ('Labour Law',           'labour-law',           '⚖️', 'Labour law and legal services'),
  ('Kitchens & Cupboards', 'kitchens-cupboards',   '🗄️', 'Kitchen and cupboard installations'),
  ('License & Registration','license-registration','📋', 'License disc and vehicle registration'),
  ('Construction',         'construction',         '🏗️', 'General construction and building')
on conflict (slug) do nothing;

-- =============================================================================
-- Business inserts — grouped by section as they appear in the PDF
-- =============================================================================

with
  ward23     as (select id from communities where slug = 'johannesburg-ward-23'),
  glenvista  as (select id from communities where slug = 'glenvista'),

  -- category lookups
  c_waterproofing    as (select id from categories where slug = 'waterproofing'),
  c_plumber          as (select id from categories where slug = 'plumber'),
  c_painter          as (select id from categories where slug = 'painter'),
  c_gutters          as (select id from categories where slug = 'gutters'),
  c_kitchens         as (select id from categories where slug = 'kitchens-cupboards'),
  c_ceilings         as (select id from categories where slug = 'ceilings'),
  c_bricklaying      as (select id from categories where slug = 'bricklaying'),
  c_construction     as (select id from categories where slug = 'construction'),
  c_aluminium        as (select id from categories where slug = 'aluminium-glass'),
  c_appliances       as (select id from categories where slug = 'appliance-repairs'),
  c_carpentry        as (select id from categories where slug = 'carpentry'),
  c_dstv             as (select id from categories where slug = 'dstv-installation'),
  c_electric_fence   as (select id from categories where slug = 'electric-fencing'),
  c_electrician      as (select id from categories where slug = 'electrician'),
  c_garage           as (select id from categories where slug = 'gate-garage-motors'),
  c_glass_tinting    as (select id from categories where slug = 'aluminium-glass'),
  c_garden           as (select id from categories where slug = 'gardener'),
  c_lapa             as (select id from categories where slug = 'lapa-outdoor'),
  c_pest             as (select id from categories where slug = 'pest-control'),
  c_solar_gas        as (select id from categories where slug = 'solar-gas'),
  c_snake            as (select id from categories where slug = 'snake-catching'),
  c_hardware         as (select id from categories where slug = 'composting-hardware'),
  c_pool             as (select id from categories where slug = 'pool-service'),
  c_vet              as (select id from categories where slug = 'vet'),
  c_dog_training     as (select id from categories where slug = 'dog-training'),
  c_birds            as (select id from categories where slug = 'bird-specialist'),
  c_printing         as (select id from categories where slug = 'printing-signage'),
  c_3d_printing      as (select id from categories where slug = '3d-printing'),
  c_gifting          as (select id from categories where slug = 'gifting-embroidery'),
  c_baking           as (select id from categories where slug = 'catering-baking'),
  c_coffee           as (select id from categories where slug = 'coffee-shop'),
  c_eatery           as (select id from categories where slug = 'restaurants'),
  c_yoga             as (select id from categories where slug = 'yoga-fitness'),
  c_nails            as (select id from categories where slug = 'nails-beauty'),
  c_hair             as (select id from categories where slug = 'hair'),
  c_massage          as (select id from categories where slug = 'massage-laser'),
  c_wellness         as (select id from categories where slug = 'wellness'),
  c_tutoring         as (select id from categories where slug = 'tutoring'),
  c_swimming         as (select id from categories where slug = 'swimming-lessons'),
  c_driving          as (select id from categories where slug = 'driving-school'),
  c_baby             as (select id from categories where slug = 'baby-mommy'),
  c_dentist          as (select id from categories where slug = 'dentist'),
  c_eye              as (select id from categories where slug = 'eye-specialist'),
  c_medical          as (select id from categories where slug = 'medical'),
  c_doula            as (select id from categories where slug = 'doula-postnatal'),
  c_first_aid        as (select id from categories where slug = 'first-aid'),
  c_ortho            as (select id from categories where slug = 'orthodontist'),
  c_tailoring        as (select id from categories where slug = 'tailoring'),
  c_butcher          as (select id from categories where slug = 'butcher'),
  c_shoe             as (select id from categories where slug = 'shoe-repairs'),
  c_photography      as (select id from categories where slug = 'photography'),
  c_locksmith        as (select id from categories where slug = 'locksmith'),
  c_gas              as (select id from categories where slug = 'gas-installation'),
  c_mattress         as (select id from categories where slug = 'mattress-cleaning'),
  c_jumping          as (select id from categories where slug = 'jumping-castles'),
  c_chairs           as (select id from categories where slug = 'chair-hire'),
  c_dish             as (select id from categories where slug = 'dish-tech'),
  c_transport        as (select id from categories where slug = 'transport-lifts'),
  c_labour_law       as (select id from categories where slug = 'labour-law'),
  c_license          as (select id from categories where slug = 'license-registration'),
  c_mechanic         as (select id from categories where slug = 'mechanic'),
  c_locksmith2       as (select id from categories where slug = 'locksmith'),

  -- Insert all businesses
  inserted as (
    insert into businesses
      (name, slug, description, primary_category_id, whatsapp, phone, status, is_community_sourced, verification_status, claimed_status)
    values

      -- ── HOME MAINTENANCE ──────────────────────────────────────────────────

      ('Clive Waterproofing',
       'clive-waterproofing',
       'Waterproofing specialist serving the Ward 23 area.',
       (select id from c_waterproofing), '0713329492', '0713329492',
       'pending', true, 'unverified', false),

      ('Johan Waterproofing',
       'johan-waterproofing',
       'Waterproofing services in Glenvista and surrounding areas.',
       (select id from c_waterproofing), '0606166859', '0606166859',
       'pending', true, 'unverified', false),

      ('Ukhozi Waterproofing',
       'ukhozi-waterproofing',
       'Waterproofing services for homes and buildings.',
       (select id from c_waterproofing), '0718056275', '0718056275',
       'pending', true, 'unverified', false),

      ('K-Way Plumbing / Kylez',
       'k-way-plumbing-kylez',
       'Plumbing services including repairs and installations.',
       (select id from c_plumber), '0814586193', '0814586193',
       'pending', true, 'unverified', false),

      ('Plumbing / Thabani',
       'plumbing-thabani',
       'Local plumber serving Ward 23.',
       (select id from c_plumber), '0606166859', '0606166859',
       'pending', true, 'unverified', false),

      ('LetsPlumb / Ellute',
       'letsplumb-ellute',
       'Plumbing repairs and installations.',
       (select id from c_plumber), '0799921412', '0799921412',
       'pending', true, 'unverified', false),

      ('Plumbing / Joe',
       'plumbing-joe',
       'Local plumbing services.',
       (select id from c_plumber), '0762163587', '0762163587',
       'pending', true, 'unverified', false),

      ('Plumbing / Theo Nel',
       'plumbing-theo-nel',
       'Plumbing services by Theo Nel.',
       (select id from c_plumber), '0832290807', '0832290807',
       'pending', true, 'unverified', false),

      ('Painter / Carlos',
       'painter-carlos',
       'Painting services — interior and exterior.',
       (select id from c_painter), '0822966957', '0822966957',
       'pending', true, 'unverified', false),

      ('Painter / Patrick',
       'painter-patrick',
       'Interior and exterior painting.',
       (select id from c_painter), '0726739653', '0726739653',
       'pending', true, 'unverified', false),

      ('Ultimate Edge Construction',
       'ultimate-edge-construction',
       'Gutter installation and construction services.',
       (select id from c_gutters), '0876301600', '0876301600',
       'pending', true, 'unverified', false),

      ('G&J Kitchens',
       'g-and-j-kitchens',
       'Custom cupboards and kitchen installations.',
       (select id from c_kitchens), '0832386221', '0832386221',
       'pending', true, 'unverified', false),

      ('Integral Spaces',
       'integral-spaces',
       'Ceiling repairs and installations.',
       (select id from c_ceilings), '0838252643', '0838252643',
       'pending', true, 'unverified', false),

      ('Thepo Bricklayer',
       'thepo-bricklayer',
       'Bricklaying and masonry work.',
       (select id from c_bricklaying), '0746842395', '0746842395',
       'pending', true, 'unverified', false),

      ('Warren Construction',
       'warren-construction',
       'General construction services.',
       (select id from c_construction), '0615239379', '0615239379',
       'pending', true, 'unverified', false),

      -- ── OTHER REPAIRS ─────────────────────────────────────────────────────

      ('Lizanne Hamon Aluminium Frames',
       'lizanne-hamon-aluminium',
       'Aluminium frame windows and doors.',
       (select id from c_aluminium), '0828806491', '0828806491',
       'pending', true, 'unverified', false),

      ('Dale Appliance Repairs',
       'dale-appliance-repairs',
       'Household appliance repairs.',
       (select id from c_appliances), '0832471223', '0832471223',
       'pending', true, 'unverified', false),

      ('DanFix Appliances',
       'danfix-appliances',
       'Appliance repair specialists.',
       (select id from c_appliances), '0729778163', '0729778163',
       'pending', true, 'unverified', false),

      ('Billy Appliance Repairs',
       'billy-appliance-repairs',
       'Household appliance repairs and servicing.',
       (select id from c_appliances), '0837260463', '0837260463',
       'pending', true, 'unverified', false),

      ('R&G Carpenter',
       'r-and-g-carpenter',
       'Carpentry and woodwork.',
       (select id from c_carpentry), '0631497791', '0631497791',
       'pending', true, 'unverified', false),

      ('Nelly Nkala Buildings',
       'nelly-nkala-buildings',
       'Building and construction services.',
       (select id from c_construction), '0738693747', '0738693747',
       'pending', true, 'unverified', false),

      ('Doug Cupboards',
       'doug-cupboards',
       'Built-in cupboards and storage solutions.',
       (select id from c_kitchens), '0763371352', '0763371352',
       'pending', true, 'unverified', false),

      ('DSTV Installer / Ryan',
       'dstv-installer-ryan',
       'DSTV and satellite dish installation.',
       (select id from c_dstv), '0826812810', '0826812810',
       'pending', true, 'unverified', false),

      ('BLK SEC Electric Fences',
       'blk-sec-electric-fences',
       'Electric fence installation and repairs.',
       (select id from c_electric_fence), '0730623898', '0730623898',
       'pending', true, 'unverified', false),

      ('Electrician / Gideon',
       'electrician-gideon',
       'Residential electrician.',
       (select id from c_electrician), '0834922516', '0834922516',
       'pending', true, 'unverified', false),

      ('Electrician / Kenny',
       'electrician-kenny',
       'Electrical repairs and installations.',
       (select id from c_electrician), '0785607392', '0785607392',
       'pending', true, 'unverified', false),

      ('Garage Door Repairs',
       'garage-door-repairs',
       'Garage door repairs and motor servicing.',
       (select id from c_garage), '0653852097', '0653852097',
       'pending', true, 'unverified', false),

      ('Gate Motors / Charmaine',
       'gate-motors-charmaine',
       'Gate motor installations and repairs.',
       (select id from c_garage), '0824623079', '0824623079',
       'pending', true, 'unverified', false),

      ('Glass Tinting / Edward',
       'glass-tinting-edward',
       'Glass tinting for home and vehicles.',
       (select id from c_glass_tinting), '0672930765', '0672930765',
       'pending', true, 'unverified', false),

      -- ── GARDEN / OUTDOOR ──────────────────────────────────────────────────

      ('The Broads Hardware',
       'the-broads-hardware',
       'Hardware store — compost and garden supplies.',
       (select id from c_hardware), '0116822302', '0116822302',
       'pending', true, 'unverified', false),

      ('Garden Talk',
       'garden-talk',
       'Garden service and maintenance.',
       (select id from c_garden), '0834123530', '0834123530',
       'pending', true, 'unverified', false),

      ('Genuine Expert Garden Service',
       'genuine-expert-garden',
       'Professional garden maintenance.',
       (select id from c_garden), '0681055958', '0681055958',
       'pending', true, 'unverified', false),

      ('Thabo Garden Services',
       'thabo-garden-services',
       'Regular garden maintenance and clean-ups.',
       (select id from c_garden), '0783561915', '0783561915',
       'pending', true, 'unverified', false),

      ('Garden Pro',
       'garden-pro',
       'Garden maintenance and pool services.',
       (select id from c_garden), '0825461917', '0825461917',
       'pending', true, 'unverified', false),

      ('Lapa Repairs / Sam',
       'lapa-repairs-sam',
       'Lapa and outdoor structure repairs.',
       (select id from c_lapa), '0649623025', '0649623025',
       'pending', true, 'unverified', false),

      ('Lyle Pest Control',
       'lyle-pest-control',
       'Pest control services.',
       (select id from c_pest), '0683878744', '0683878744',
       'pending', true, 'unverified', false),

      ('Reliance Pest Control',
       'reliance-pest-control',
       'Pest and rodent control.',
       (select id from c_pest), '0725505073', '0725505073',
       'pending', true, 'unverified', false),

      ('Solar Systems / Yudesh',
       'solar-systems-yudesh',
       'Solar system installation and maintenance.',
       (select id from c_solar_gas), '0725505073', '0725505073',
       'pending', true, 'unverified', false),

      ('Snake Catcher / Phillip',
       'snake-catcher-phillip',
       'Safe snake removal and relocation.',
       (select id from c_snake), '0836633021', '0836633021',
       'pending', true, 'unverified', false),

      ('Julian Wild Ones Snakes',
       'julian-wild-ones-snakes',
       'Professional snake catcher — wild ones specialist.',
       (select id from c_snake), '0847063268', '0847063268',
       'pending', true, 'unverified', false),

      -- ── POOL SERVICE ──────────────────────────────────────────────────────

      ('Pool Service / Lucky',
       'pool-service-lucky',
       'Swimming pool cleaning and maintenance.',
       (select id from c_pool), '0730407414', '0730407414',
       'pending', true, 'unverified', false),

      ('Pool Service / Gerhard',
       'pool-service-gerhard',
       'Pool maintenance and chemical balancing.',
       (select id from c_pool), '0799921412', '0799921412',
       'pending', true, 'unverified', false),

      ('Pool Service / Brian',
       'pool-service-brian',
       'Swimming pool cleaning and maintenance.',
       (select id from c_pool), '0829708473', '0829708473',
       'pending', true, 'unverified', false),

      -- ── ANIMALS ───────────────────────────────────────────────────────────

      ('Dog Training Club',
       'dog-training-club',
       'Dog obedience training and behaviour classes.',
       (select id from c_dog_training), '0608455461', '0608455461',
       'pending', true, 'unverified', false),

      ('Dr Ash Vet',
       'dr-ash-vet',
       'Veterinary practice — Dr Ash.',
       (select id from c_vet), '0114320505', '0114320505',
       'pending', true, 'unverified', false),

      ('Birds / Jen Ley',
       'birds-jen-ley',
       'Bird specialist — Jen Ley.',
       (select id from c_birds), '0838822899', '0838822899',
       'pending', true, 'unverified', false),

      ('Birds / Errol',
       'birds-errol',
       'Bird specialist — Errol.',
       (select id from c_birds), '0827097700', '0827097700',
       'pending', true, 'unverified', false),

      -- ── PRINTING & SIGNAGE ────────────────────────────────────────────────

      ('3D Printing',
       '3d-printing-ward23',
       '3D printing services.',
       (select id from c_3d_printing), '0646383277', '0646383277',
       'pending', true, 'unverified', false),

      ('Printing Flyers & More',
       'printing-flyers-and-more',
       'Flyer and document printing, large format available.',
       (select id from c_printing), '0645472715', '0645472715',
       'pending', true, 'unverified', false),

      ('PostNet Glen Signage',
       'postnet-glen-signage',
       'Signage and printing — PostNet Glenvista.',
       (select id from c_printing), '0685328519', '0114360848',
       'pending', true, 'unverified', false),

      ('Thomas Signage',
       'thomas-signage',
       'Custom signage solutions.',
       (select id from c_printing), '0837843131', '0837843131',
       'pending', true, 'unverified', false),

      ('Saaji Printed Gifting',
       'saaji-printed-gifting',
       'Printed gifting and personalised items.',
       (select id from c_gifting), '0823151483', '0823151483',
       'pending', true, 'unverified', false),

      -- ── FOOD RELATED ──────────────────────────────────────────────────────

      ('Belinda Home Cooked Meals',
       'belinda-home-cooked-meals',
       'Home cooked meals — order for delivery or collection.',
       (select id from c_baking), '0833258667', '0833258667',
       'pending', true, 'unverified', false),

      ('Sharondale Nursery Waffles',
       'sharondale-nursery-waffles',
       'Waffles available at Sharondale Nursery.',
       (select id from c_baking), '0118678021', '0118678021',
       'pending', true, 'unverified', false),

      ('Nabeela Cakes & Desserts',
       'nabeela-cakes-and-desserts',
       'Custom cakes and desserts.',
       (select id from c_baking), '0726868274', '0726868274',
       'pending', true, 'unverified', false),

      ('Khadijah Cakes',
       'khadijah-cakes',
       'Custom cake orders.',
       (select id from c_baking), '0822004581', '0822004581',
       'pending', true, 'unverified', false),

      ('Shayda Mansoor Baker',
       'shayda-mansoor-baker',
       'Artisan baker — custom orders.',
       (select id from c_baking), '0846563203', '0846563203',
       'pending', true, 'unverified', false),

      ('Jocelyn Baker',
       'jocelyn-baker',
       'Home baker — custom orders.',
       (select id from c_baking), '0837389279', '0837389279',
       'pending', true, 'unverified', false),

      ('Gitta Baker',
       'gitta-baker',
       'Home baker.',
       (select id from c_baking), '0744246740', '0744246740',
       'pending', true, 'unverified', false),

      ('Bembom Coffee Shop',
       'bembom-coffee-shop',
       'Local coffee shop.',
       (select id from c_coffee), '0107452474', '0107452474',
       'pending', true, 'unverified', false),

      ('Geeta''s Eatery Veg & Vegan',
       'geetas-eatery-veg-vegan',
       'Vegetarian and vegan eatery.',
       (select id from c_eatery), '0761366519', '0761366519',
       'pending', true, 'unverified', false),

      -- ── BEAUTY / WELLNESS ─────────────────────────────────────────────────

      ('Aerial Yoga',
       'aerial-yoga',
       'Aerial yoga classes.',
       (select id from c_yoga), '0827845905', '0827845905',
       'pending', true, 'unverified', false),

      ('Sue Nail Pedis',
       'sue-nail-pedis',
       'Nail and pedicure services.',
       (select id from c_nails), '0827886698', '0827886698',
       'pending', true, 'unverified', false),

      ('Mariam Hair & Beauty',
       'mariam-hair-beauty',
       'Hair and beauty services.',
       (select id from c_hair), '0815777589', '0815777589',
       'pending', true, 'unverified', false),

      ('Blo Hair & Beauty',
       'blo-hair-and-beauty',
       'Hair and beauty salon.',
       (select id from c_hair), '0620127538', '0620127538',
       'pending', true, 'unverified', false),

      ('Kim Hair',
       'kim-hair',
       'Hair services.',
       (select id from c_hair), '0787315122', '0787315122',
       'pending', true, 'unverified', false),

      ('Jessica Salon',
       'jessica-salon',
       'Hair and beauty salon.',
       (select id from c_hair), '0728355474', '0728355474',
       'pending', true, 'unverified', false),

      ('Merissa Massage & Laser',
       'merissa-massage-laser',
       'Massage therapy and laser treatments.',
       (select id from c_massage), '0728072338', '0728072338',
       'pending', true, 'unverified', false),

      ('Candice Wellness',
       'candice-wellness',
       'Wellness practitioner.',
       (select id from c_wellness), '0820956010', '0820956010',
       'pending', true, 'unverified', false),

      -- ── EDUCATION / SPORTS ────────────────────────────────────────────────

      ('Ori Math Tutor',
       'ori-math-tutor',
       'Mathematics tutoring.',
       (select id from c_tutoring), '0829252991', '0829252991',
       'pending', true, 'unverified', false),

      ('Jackie''s Tuition Center',
       'jackies-tuition-center',
       'Tuition centre for learners.',
       (select id from c_tutoring), '0835561207', '0835561207',
       'pending', true, 'unverified', false),

      ('Dr Selma Afrikaans Tutor',
       'dr-selma-afrikaans-tutor',
       'Afrikaans tutoring by Dr Selma.',
       (select id from c_tutoring), '0825622269', '0825622269',
       'pending', true, 'unverified', false),

      ('Nana''s Swimming Lessons',
       'nanas-swimming-lessons',
       'Swimming lessons for all ages.',
       (select id from c_swimming), '0727296708', '0727296708',
       'pending', true, 'unverified', false),

      ('Reitvlei Swimming Lessons',
       'reitvlei-swimming-lessons',
       'Swimming lessons at Reitvlei.',
       (select id from c_swimming), '0799381455', '0799381455',
       'pending', true, 'unverified', false),

      ('Driving School',
       'driving-school-ward23',
       'Driving lessons and learner driver tuition.',
       (select id from c_driving), '0824040427', '0824040427',
       'pending', true, 'unverified', false),

      ('Mommy & Baby Classes',
       'mommy-and-baby-classes',
       'Classes for moms and babies.',
       (select id from c_baby), '0724375796', '0724375796',
       'pending', true, 'unverified', false),

      -- ── HEALTH & CARE ─────────────────────────────────────────────────────

      ('Dr Lopez Oakdene Dentist',
       'dr-lopez-oakdene-dentist',
       'Dental practice — Dr Lopez, Oakdene.',
       (select id from c_dentist), '0114359279', '0114359279',
       'pending', true, 'unverified', false),

      ('MH Patel Dentist',
       'mh-patel-dentist',
       'Dental practice — MH Patel.',
       (select id from c_dentist), '0731484385', '0731484385',
       'pending', true, 'unverified', false),

      ('Dr Jervis Eye Specialist',
       'dr-jervis-eye-specialist',
       'Eye specialist — Dr Jervis.',
       (select id from c_eye), '0118697153', '0118697153',
       'pending', true, 'unverified', false),

      ('Dr Natalie Mulmed',
       'dr-natalie-mulmed',
       'Medical practitioner — Dr Natalie Mulmed.',
       (select id from c_medical), '0116822914', '0116822914',
       'pending', true, 'unverified', false),

      ('Dr Girlando',
       'dr-girlando',
       'Medical practitioner — Dr Girlando.',
       (select id from c_medical), '0114353129', '0114353129',
       'pending', true, 'unverified', false),

      ('Doula',
       'doula-ward23',
       'Doula and birth support services.',
       (select id from c_doula), '0607494215', '0607494215',
       'pending', true, 'unverified', false),

      ('Post Natal Support',
       'post-natal-support',
       'Post-natal support and care.',
       (select id from c_doula), '0726776957', '0726776957',
       'pending', true, 'unverified', false),

      ('First Aid Course',
       'first-aid-course',
       'First aid training and certification.',
       (select id from c_first_aid), '0834341634', '0834341634',
       'pending', true, 'unverified', false),

      ('Dr Du Toit Orthodontist',
       'dr-du-toit-orthodontist',
       'Orthodontist — Dr Du Toit.',
       (select id from c_ortho), '0119079265', '0119079265',
       'pending', true, 'unverified', false),

      -- ── OTHER ─────────────────────────────────────────────────────────────

      ('Clothing Tailor',
       'clothing-tailor-ward23',
       'Clothing alterations and tailoring.',
       (select id from c_tailoring), '0734916372', '0734916372',
       'pending', true, 'unverified', false),

      ('Clothing Tailor Sharon',
       'clothing-tailor-sharon',
       'Clothing alterations — Sharon.',
       (select id from c_tailoring), '0650667231', '0650667231',
       'pending', true, 'unverified', false),

      ('Matt Butcher',
       'matt-butcher',
       'Local butcher — Matt.',
       (select id from c_butcher), '0825707831', '0825707831',
       'pending', true, 'unverified', false),

      ('Halaal Butchery',
       'halaal-butchery',
       'Halaal certified butchery.',
       (select id from c_butcher), '0692341595', '0692341595',
       'pending', true, 'unverified', false),

      ('Meat World Alberton',
       'meat-world-alberton',
       'Meat supplier — Alberton.',
       (select id from c_butcher), '0110243530', '0110243530',
       'pending', true, 'unverified', false),

      ('Shoe Repairs',
       'shoe-repairs-ward23',
       'Shoe repairs and cobbler services.',
       (select id from c_shoe), '0822278394', '0822278394',
       'pending', true, 'unverified', false),

      ('Candice Photographer',
       'candice-photographer',
       'Photography for events and portraits.',
       (select id from c_photography), '0780757569', '0780757569',
       'pending', true, 'unverified', false),

      ('Karabo Photography',
       'karabo-photography',
       'Photography services — Karabo.',
       (select id from c_photography), '0610998559', '0610998559',
       'pending', true, 'unverified', false),

      ('License Disc & Plates',
       'license-disc-and-plates',
       'Vehicle license disc and plate services.',
       (select id from c_license), '0608293916', '0608293916',
       'pending', true, 'unverified', false),

      ('Mattress Cleaning',
       'mattress-cleaning-ward23',
       'Professional mattress and upholstery cleaning.',
       (select id from c_mattress), '0832398902', '0832398902',
       'pending', true, 'unverified', false),

      ('Gas Stoves / Brian',
       'gas-stoves-brian',
       'Gas stove supply and installation.',
       (select id from c_gas), '0829708473', '0829708473',
       'pending', true, 'unverified', false),

      ('Fun-FX Jumping Castles',
       'fun-fx-jumping-castles',
       'Jumping castle hire for events and parties.',
       (select id from c_jumping), '0111005105', '0111005105',
       'pending', true, 'unverified', false),

      ('Pam Embroidery',
       'pam-embroidery',
       'Custom embroidery services.',
       (select id from c_gifting), '0823073496', '0823073496',
       'pending', true, 'unverified', false),

      ('Chair Hire',
       'chair-hire-ward23',
       'Chair and event equipment hire.',
       (select id from c_chairs), '0114361715', '0114361715',
       'pending', true, 'unverified', false),

      ('Excel Gas Installation',
       'excel-gas-installation',
       'Gas installation services.',
       (select id from c_gas), '0716126366', '0716126366',
       'pending', true, 'unverified', false),

      ('Dish Tech',
       'dish-tech-ward23',
       'Satellite dish and TV aerial services.',
       (select id from c_dish), '0833638098', '0833638098',
       'pending', true, 'unverified', false),

      ('Gerrie Locksmith',
       'gerrie-locksmith',
       'Locksmith services — Gerrie.',
       (select id from c_locksmith), '0731520320', '0731520320',
       'pending', true, 'unverified', false),

      -- ── TRANSPORT ─────────────────────────────────────────────────────────

      ('Momos Lyft Club',
       'momos-lyft-club',
       'Lift club and transport services.',
       (select id from c_transport), '0682756334', '0682756334',
       'pending', true, 'unverified', false),

      ('Trusha''s Transport',
       'trushas-transport',
       'Transport services — Trusha.',
       (select id from c_transport), '0837844970', '0837844970',
       'pending', true, 'unverified', false),

      -- ── LAW & MORE ────────────────────────────────────────────────────────

      ('Malcolm Labour Law',
       'malcolm-labour-law',
       'Labour law advice and services.',
       (select id from c_labour_law), '0824574987', '0824574987',
       'pending', true, 'unverified', false)

    on conflict (slug) do update set
      phone    = excluded.phone,
      whatsapp = excluded.whatsapp,
      updated_at = now()

    returning id, slug
  )

-- Link every inserted business to Ward 23 + Glenvista
insert into business_communities (business_id, community_id)
select b.id, c.id
from inserted b
cross join (
  select id from communities
  where slug in ('johannesburg-ward-23', 'glenvista')
) c
on conflict (business_id, community_id) do nothing;
