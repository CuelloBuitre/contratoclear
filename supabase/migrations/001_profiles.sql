-- profiles table
-- Auto-created for every new Supabase Auth user via trigger

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  plan text not null default 'none',            -- none | single | pack | pro
  credits_remaining integer not null default 0,
  credits_expiry timestamptz,                   -- for pack plan (90 days)
  stripe_customer_id text,
  stripe_subscription_id text,                  -- for pro plan
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- updated_at auto-update
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
