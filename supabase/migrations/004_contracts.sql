-- Active contract monitor table
create table contracts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tenant_name text not null,
  property_address text not null,
  rent_amount numeric(10, 2) not null,
  contract_start date not null,
  contract_end date,                              -- null = open-ended
  deposit_amount numeric(10, 2) not null default 0,
  deposit_returned boolean not null default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table contracts enable row level security;

create policy "users can read own contracts"
  on contracts for select using (auth.uid() = user_id);

create policy "users can insert own contracts"
  on contracts for insert with check (auth.uid() = user_id);

create policy "users can update own contracts"
  on contracts for update using (auth.uid() = user_id);

create policy "users can delete own contracts"
  on contracts for delete using (auth.uid() = user_id);

-- Index for fast listing by user + expiry
create index contracts_user_id_idx on contracts(user_id);
create index contracts_contract_end_idx on contracts(contract_end);

-- Auto-update updated_at on change
create or replace function update_contracts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contracts_updated_at
  before update on contracts
  for each row execute function update_contracts_updated_at();
