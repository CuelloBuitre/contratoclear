create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  category text not null,
  created_at timestamptz default now()
);
