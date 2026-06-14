-- ============================================================
-- greenó — FULL RESET + REBUILD
-- ============================================================

-- 1. Drop ALL old tables (including old schema)
drop table if exists daily_special      cascade;
drop table if exists categories         cascade;
drop table if exists opening_hours      cascade;
drop table if exists restaurant_config  cascade;
drop table if exists restaurant_status  cascade;
drop table if exists menu_items         cascade;
drop table if exists orders             cascade;
drop table if exists settings           cascade;

-- 2. Create menu_items (with is_special column from the start)
create table menu_items (
  id             serial primary key,
  name           text    not null,
  description    text,
  price          numeric not null,
  cal            int,
  tags           text[]  default '{}',
  color          text    default '#8FA888',
  category       text    not null,
  available      boolean default true,
  is_special     boolean default false,
  original_price numeric,
  sold           int     default 0,
  created_at     timestamptz default now()
);

-- 3. Create orders
create table orders (
  id         serial primary key,
  items_text text    not null,
  total      numeric not null,
  status     text    not null default 'Preparing',
  phone      text,
  address    text,
  note       text,
  created_at timestamptz default now()
);

-- 4. Create settings (single-row)
create table settings (
  id              int primary key default 1,
  restaurant_name text    default 'greenó',
  tagline         text    default 'Eat Clean. Live Green.',
  whatsapp        text    default '201234567890',
  delivery_fee    numeric default 20,
  min_order       numeric default 100,
  delivery_time   text    default '30–45 min',
  is_open         boolean default true,
  hours           jsonb   default '[]',
  categories      text[]  default '{Salads,Bowls,Smoothies,Treats}',
  updated_at      timestamptz default now()
);

-- 5. Default settings row
insert into settings (id) values (1);

-- 6. Seed menu items
insert into menu_items
  (name, description, price, cal, tags, color, category, available, is_special, original_price, sold)
values
  ('Grilled Quinoa Bowl',    'Quinoa, avocado, roasted chickpeas, cherry tomatoes, lemon-tahini dressing', 145, 420, '{Vegan,"High Protein"}',   '#8FA888', 'Bowls',     true,  false, null, 0),
  ('Grilled Salmon Salad',   'Norwegian salmon, mixed greens, fennel, quinoa, dill sauce',                 195, 380, '{Omega-3,"Low Carb"}',     '#D98B5F', 'Salads',    true,  false, null, 0),
  ('Green Detox Juice',      'Spinach, green apple, cucumber, mint, ginger, lemon',                        65,  110, '{Detox,"Sugar Free"}',     '#8FA888', 'Smoothies', true,  false, null, 0),
  ('Citrus Avocado Salad',   'Mixed leaves, orange segments, avocado, toasted almonds, citrus vinaigrette',130, 310, '{Vegan,"Gluten Free"}',    '#D98B5F', 'Salads',    true,  false, null, 0),
  ('Mango Protein Smoothie', 'Mango, banana, almond milk, plant protein, chia seeds',                      80,  240, '{"High Protein",Vegan}',   '#8FA888', 'Smoothies', true,  false, null, 0),
  ('Energy Date Bites',      'Dates, almonds, oats, cacao, shredded coconut',                              55,  160, '{"No Sugar Added",Vegan}', '#D98B5F', 'Treats',    false, false, null, 0),
  ('Buddha Bowl',            'Roasted sweet potato, kale, edamame, brown rice, peanut-ginger sauce',      120, 450, '{Vegan,"Today Only"}',     '#D98B5F', 'Bowls',     true,  true,  150,  0);

-- 7. RLS
alter table menu_items enable row level security;
alter table orders     enable row level security;
alter table settings   enable row level security;

create policy "read menu"   on menu_items for select using (true);
create policy "write menu"  on menu_items for all    using (true) with check (true);

create policy "read orders"   on orders for select using (true);
create policy "insert orders" on orders for insert  with check (true);
create policy "update orders" on orders for update  using (true) with check (true);

create policy "read settings"   on settings for select using (true);
create policy "update settings" on settings for update using (true) with check (true);
