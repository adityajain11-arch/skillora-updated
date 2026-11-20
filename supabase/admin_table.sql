-- Skillora Internship Portal - Dedicated Admins Table SQL
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor and click RUN.

-- 1. Create Admins Table
create table if not exists public.admins (
  id text primary key,
  email text unique not null,
  password text not null,
  full_name text not null,
  role text not null default 'super_admin',
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS) for Supabase Publishable Client Access
alter table public.admins enable row level security;

-- 3. Create RLS Policy allowing client operations
drop policy if exists "skillora_public_all_admins" on public.admins;
create policy "skillora_public_all_admins" on public.admins 
  for all using (true) with check (true);

-- 4. Seed the Authorized Admin Account
-- Email: admin22@skillora.com | Password: Aditya@222006
insert into public.admins (id, email, password, full_name, role)
values (
  'ADM-2026-001',
  'admin22@skillora.com',
  'Aditya@222006',
  'Aditya Jain',
  'super_admin'
)
on conflict (email) do update 
set password = excluded.password, 
    full_name = excluded.full_name, 
    role = excluded.role;

-- 5. Create Index for fast login lookups
create index if not exists idx_admins_email on public.admins(email);
