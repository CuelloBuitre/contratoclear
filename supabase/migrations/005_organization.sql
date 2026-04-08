-- Organization branding table (1:1 with profiles, Pro only)
create table organizations (
  id uuid references profiles(id) on delete cascade primary key,
  name text not null,
  logo_url text,
  primary_color text not null default '#1a1a2e',
  contact_email text,
  updated_at timestamptz default now()
);

alter table organizations enable row level security;

create policy "users can read own organization"
  on organizations for select using (auth.uid() = id);

create policy "users can insert own organization"
  on organizations for insert with check (auth.uid() = id);

create policy "users can update own organization"
  on organizations for update using (auth.uid() = id);

-- Storage bucket for organization logos
-- Run after migration: supabase storage create logos --public
