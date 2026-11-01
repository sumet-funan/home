-- Answers per day, for the Progress chart and for a daily goal and day streak
-- that follow the account instead of the device. Speed quiz rounds are marked in
-- bulk and have no attempts rows, so their right answers are added here; a day
-- with only a speed quiz is still a day of practice.
-- The day is the child's own, so the browser passes its time zone.
create function public.daily_activity(tz text)
returns table (day date, answers bigint)
language sql
stable
set search_path = ''
as $$
  select activity.day, sum(activity.answers)::bigint
  from (
    select (a.created_at at time zone tz)::date as day, count(*) as answers
    from public.attempts a
    where a.user_id = auth.uid()
    group by 1
    union all
    select (q.created_at at time zone tz)::date, sum(q.correct_count)
    from public.quiz_results q
    where q.user_id = auth.uid()
    group by 1
  ) activity
  group by activity.day
  order by activity.day;
$$;

revoke all on function public.daily_activity(text) from public, anon;
grant execute on function public.daily_activity(text) to authenticated, service_role;

-- Final quiz scores. These stay out of quiz_results, whose rows are speed quiz
-- rounds and would be misread if they held anything else. Append-only, like
-- attempts: a score is a record of what happened.
create table public.final_quiz_results (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  grade         text not null check (grade in ('p1', 'p2', 'p5')),
  correct_count integer not null check (correct_count >= 0),
  total         integer not null check (total > 0),
  created_at    timestamptz not null default now(),
  check (correct_count <= total)
);

create index final_quiz_results_user_time on public.final_quiz_results (user_id, created_at desc);

alter table public.final_quiz_results enable row level security;

create policy "read own final quiz results" on public.final_quiz_results
  for select to authenticated using (auth.uid() = user_id);

create policy "insert own final quiz results" on public.final_quiz_results
  for insert to authenticated with check (auth.uid() = user_id);

revoke all on public.final_quiz_results from anon, authenticated;
grant select, insert on public.final_quiz_results to authenticated;
grant select, insert, update, delete on public.final_quiz_results to service_role;
