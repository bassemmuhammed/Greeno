-- ============================================================
-- greenó — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. MENU ITEMS
create table if not exists menu_items (
  id          serial primary key,
  name        text not null,
  description text,
  price       numeric not null,
  cal         int,
  tags        text[]    default '{}',
  color       text      default '#8FA888',
  category    text      not null,
  available   boolean   default true,
  is_special  boolean   default false,
  original_price numeric,
  sold        int       default 0,
  created_at  timestamptz default now()
);

-- 2. ORDERS
create table if not exists orders (
  id          serial primary key,
  items_text  text not null,
  total       numeric not null,
  status      text not null default 'Preparing',
  phone       text,
  address     text,
  note        text,
  created_at  timestamptz default now()
);

-- 3. SETTINGS (single row)
create table if not exists settings (
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

-- 4. Insert default settings row
insert into settings (id) values (1)
on conflict (id) do nothing;

-- 5. Seed menu items
insert into menu_items (name, description, price, cal, tags, color, category, available, sold) values
  ('Grilled Quinoa Bowl',    'Quinoa, avocado, roasted chickpeas, cherry tomatoes, lemon-tahini dressing', 145, 420, '{Vegan,"High Protein"}',     '#8FA888', 'Bowls',     true,  0),
  ('Grilled Salmon Salad',   'Norwegian salmon, mixed greens, fennel, quinoa, dill sauce',                 195, 380, '{Omega-3,"Low Carb"}',       '#D98B5F', 'Salads',    true,  0),
  ('Green Detox Juice',      'Spinach, green apple, cucumber, mint, ginger, lemon',                        65,  110, '{Detox,"Sugar Free"}',       '#8FA888', 'Smoothies', true,  0),
  ('Citrus Avocado Salad',   'Mixed leaves, orange segments, avocado, toasted almonds, citrus vinaigrette',130, 310, '{Vegan,"Gluten Free"}',      '#D98B5F', 'Salads',    true,  0),
  ('Mango Protein Smoothie', 'Mango, banana, almond milk, plant protein, chia seeds',                      80,  240, '{"High Protein",Vegan}',     '#8FA888', 'Smoothies', true,  0),
  ('Energy Date Bites',      'Dates, almonds, oats, cacao, shredded coconut',                              55,  160, '{"No Sugar Added",Vegan}',   '#D98B5F', 'Treats',    false, 0),
  ('Buddha Bowl',            'Roasted sweet potato, kale, edamame, brown rice, peanut-ginger sauce',      120, 450, '{Vegan,"Today Only"}',       '#D98B5F', 'Bowls',     true,  0)
on conflict do nothing;

-- Mark Buddha Bowl as daily special
update menu_items set is_special = true, original_price = 150 where name = 'Buddha Bowl';

-- 6. RLS Policies
alter table menu_items enable row level security;
alter table orders     enable row level security;
alter table settings   enable row level security;

-- menu_items: anyone can read, anyone can write (owner uses same frontend for now)
create policy "read menu"   on menu_items for select using (true);
create policy "write menu"  on menu_items for all    using (true) with check (true);

-- orders: anyone can insert + read (customer places, owner reads)
create policy "read orders"   on orders for select using (true);
create policy "insert orders" on orders for insert with check (true);
create policy "update orders" on orders for update using (true) with check (true);

-- settings: anyone can read + update
create policy "read settings"   on settings for select using (true);
create policy "update settings" on settings for update using (true) with check (true);
