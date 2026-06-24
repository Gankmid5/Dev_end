-- ═══════════════════════════════════════════════════════════════════════════
-- DEV TYCOON — SUPABASE DATABASE SCHEMA SETUP
-- Run this script in the SQL Editor of your Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable UUID Extension if not already done
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES Table (Public User Info)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  zodiac text,
  specialization text,
  color text default '#00e5ff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create DEV_TYCOON_STATS Table
create table if not exists public.dev_tycoon_stats (
  user_id uuid references auth.users on delete cascade primary key,
  company_name text default 'Garage Devs',
  office_tier text default 'Garage',
  cash numeric(20, 2) default 500.00,
  net_worth numeric(20, 2) default 500.00,
  coding_skill integer default 10,
  design_skill integer default 10,
  management_skill integer default 10,
  research_points integer default 0,
  games_released integer default 0,
  games_sold bigint default 0,
  employees_count integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS) on the tables
alter table public.profiles enable row level security;
alter table public.dev_tycoon_stats enable row level security;

-- 5. RLS Policies for PROFILES (if they don't already exist)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow public read access to profiles') then
    create policy "Allow public read access to profiles" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow users to insert their own profile') then
    create policy "Allow users to insert their own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow users to update their own profile') then
    create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end
$$;

-- 6. RLS Policies for DEV_TYCOON_STATS
create policy "Allow public read access to dev tycoon stats" 
  on public.dev_tycoon_stats for select 
  using (true);

create policy "Allow users to insert their own dev tycoon stats" 
  on public.dev_tycoon_stats for insert 
  with check (auth.uid() = user_id);

create policy "Allow users to update their own dev tycoon stats" 
  on public.dev_tycoon_stats for update 
  using (auth.uid() = user_id);
