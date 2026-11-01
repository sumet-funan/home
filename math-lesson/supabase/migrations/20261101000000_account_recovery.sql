-- Recovery codes let a child back into an account without email. Only a keyed
-- hash is kept, and nothing here is reachable from the browser: RLS is on with no
-- policies, so all access goes through the account-recovery Edge Function.

create table public.recovery_codes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  code_hash  text not null unique,
  created_at timestamptz not null default now()
);

-- Failed guesses, kept for an hour, so that a code cannot be guessed by trying.
create table public.recovery_attempts (
  id         uuid primary key default gen_random_uuid(),
  bucket     text not null,
  created_at timestamptz not null default now()
);

create index recovery_attempts_bucket_time on public.recovery_attempts (bucket, created_at);

alter table public.recovery_codes enable row level security;
alter table public.recovery_attempts enable row level security;

revoke all on public.recovery_codes from anon, authenticated;
revoke all on public.recovery_attempts from anon, authenticated;

grant select, insert, update, delete on public.recovery_codes to service_role;
grant select, insert, update, delete on public.recovery_attempts to service_role;
