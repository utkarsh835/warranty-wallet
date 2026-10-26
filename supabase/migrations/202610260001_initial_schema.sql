-- Warranty Wallet schema. Run in the Supabase SQL Editor as project owner.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9]{3,20}$')
);
create unique index if not exists profiles_username_lower_unique on public.profiles (lower(username));

create or replace function public.add_months_clamped(source_date date, month_count integer)
returns date language plpgsql immutable strict set search_path = '' as $$
declare target_month date; target_day integer;
begin
  target_month := (date_trunc('month', source_date::timestamp) + make_interval(months => month_count))::date;
  target_day := least(extract(day from source_date)::integer, extract(day from (target_month + interval '1 month - 1 day'))::integer);
  return target_month + (target_day - 1);
end; $$;

create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null check (char_length(btrim(product_name)) between 1 and 120),
  brand text check (brand is null or char_length(brand) <= 80),
  category text check (category is null or char_length(category) <= 40),
  purchase_date date not null,
  warranty_months integer not null check (warranty_months between 1 and 1200),
  expiry_date date generated always as public.add_months_clamped(purchase_date, warranty_months) stored,
  seller text check (seller is null or char_length(seller) <= 120),
  serial_number text check (serial_number is null or char_length(serial_number) <= 120),
  purchase_price numeric(12,2) check (purchase_price is null or purchase_price >= 0),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists warranties_user_id_idx on public.warranties(user_id);
create index if not exists warranties_user_expiry_idx on public.warranties(user_id, expiry_date);
create index if not exists warranties_user_purchase_idx on public.warranties(user_id, purchase_date desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists warranties_set_updated_at on public.warranties;
create trigger warranties_set_updated_at before update on public.warranties for each row execute function public.set_updated_at();

-- Create a profile atomically on signup. Invalid/duplicate usernames fail signup rather than
-- creating an auth account with no profile. The trigger runs with its owner's privileges.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare supplied_username text;
begin
  supplied_username := new.raw_user_meta_data ->> 'username';
  if supplied_username is null or supplied_username !~ '^[A-Za-z0-9]{3,20}$' then
    raise exception 'Username must contain 3-20 ASCII letters or digits.' using errcode = '23514';
  end if;
  insert into public.profiles (id, username) values (new.id, supplied_username);
  return new;
end; $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.warranties enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users can read own warranties" on public.warranties;
create policy "Users can read own warranties" on public.warranties for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can add own warranties" on public.warranties;
create policy "Users can add own warranties" on public.warranties for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own warranties" on public.warranties;
create policy "Users can update own warranties" on public.warranties for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own warranties" on public.warranties;
create policy "Users can delete own warranties" on public.warranties for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.warranties to authenticated;
