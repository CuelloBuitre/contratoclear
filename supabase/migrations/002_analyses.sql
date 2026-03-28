-- analyses table
-- Stores the result of each Claude API contract analysis

create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  filename text not null,
  puntuacion text not null,                     -- buena | aceptable | mala
  result_json jsonb not null,                   -- full Claude API response (AnalysisResult)
  law_version text not null,                    -- from ley-context.md last_updated field
  created_at timestamptz default now()
);

alter table analyses enable row level security;

create policy "users can read own analyses"
  on analyses for select using (auth.uid() = user_id);

-- Insert is controlled by the Edge Function using the service role key
-- The Edge Function verifies auth + credits before inserting
create policy "edge function can insert analyses"
  on analyses for insert with check (true);

-- Index for fast per-user history lookups
create index analyses_user_id_created_at_idx
  on analyses (user_id, created_at desc);
