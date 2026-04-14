-- Add user_type and onboarding_completed to profiles

alter table profiles
add column if not exists user_type text default 'inquilino'
check (user_type in ('inquilino', 'propietario', 'profesional'));

alter table profiles
add column if not exists onboarding_completed boolean default false;
