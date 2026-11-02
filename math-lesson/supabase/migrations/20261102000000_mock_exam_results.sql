-- Practice paper scores (NT ป.3, O-NET ป.6), out of 100. Kept apart from
-- final_quiz_results, whose rows are counts of right answers: these are points,
-- with the O-NET's 6.5 and 7.125 per item. Append-only, like the other results.
create table public.mock_exam_results (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  exam       text not null check (exam in ('nt3', 'onet6')),
  score      numeric(6, 3) not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

create index mock_exam_results_user_time on public.mock_exam_results (user_id, created_at desc);

alter table public.mock_exam_results enable row level security;

create policy "read own mock exam results" on public.mock_exam_results
  for select to authenticated using (auth.uid() = user_id);

create policy "insert own mock exam results" on public.mock_exam_results
  for insert to authenticated with check (auth.uid() = user_id);

revoke all on public.mock_exam_results from anon, authenticated;
grant select, insert on public.mock_exam_results to authenticated;
grant select, insert, update, delete on public.mock_exam_results to service_role;
