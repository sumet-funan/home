# Roadmap — Math Lesson

Ideas not yet built, with enough reasoning to pick them up cold. Written
2026-08-24.

---

# Next up: spaced repetition

Practice only sticks if it is revisited just as it is about to be forgotten.
Right now a child re-practises whatever they happen to click on, and a topic
they struggled with three weeks ago may never come back.

## The constraint that shapes the design

**We do not store the question or its correct answer.** An attempt row holds
`expression` — `"6 + 9 = 20"` — which embeds the child's *wrong* answer, and
nothing recording that the answer was 15. The app never displays the correct
answer either, so it cannot be recovered later.

So the smallest thing we can currently schedule is a **lesson**, not a fact.
That splits the work in two.

## Stage 1 — schedule topics (works with today's data)

A Leitner ladder per lesson. Each lesson sits in a box; the box sets how long
until it is due again.

| Box | Next due in |
| --- | --- |
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 14 days |
| 5 | 30 days |

After practising a lesson, judge it on accuracy across the **last 10 attempts**
in that lesson:

- **≥ 80% correct** → box + 1 (max 5)
- **< 60% correct** → box back to 1
- **in between** → box unchanged, due date pushed by the current interval

Sliding window rather than session boundaries: no need to define when a session
starts or ends, and one query plus one upsert per answer is cheap.

### Schema

```sql
create table public.lesson_reviews (
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  text not null,
  box        int  not null default 1 check (box between 1 and 5),
  due_at     timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_reviews enable row level security;
-- select / insert / update policies on auth.uid() = user_id, as elsewhere
```

### Interface

- A **ทบทวนวันนี้** card at the top of the Progress page listing lessons that
  are due, most overdue first, each with a practise button (same pattern as
  ฝึกแก้).
- A count badge on the ความก้าวหน้า sidebar item, so it is visible without
  opening the page.
- When nothing is due: a positive empty state, not a blank card.

### Two things to get right

**Cap the daily list at 3–5 lessons.** This is the failure mode of every
spaced-repetition system: a child returns after a week, finds fourteen topics
due, and gives up. Show the most overdue few and let the rest wait.

**Signed-in only.** Scheduling needs history that follows the child; a guest on
a shared device has neither. Guests keep the app exactly as it is now — nothing
should nag them to sign in.

## Stage 2 — schedule individual facts (needs new data)

Once operands are recorded, `7 × 8` can be scheduled on its own ladder instead
of the whole คูณ topic. Far more precise: a child who only ever misses the
sevens stops re-practising the twos.

Requires storing the operands and the correct answer at grading time. The
central `showFeedback` hook cannot see them — they live in each lesson's own
state — so this means touching all lesson modules, and it only helps attempts
made *after* it ships. Worth doing, but start Stage 1 first: it delivers most
of the benefit and needs no per-lesson work.

## Relationship to ข้อที่ต้องแก้

The existing mistakes feature is a crude cousin — it also nudges topic
practice. Keep both: mistakes answer "what did I get wrong", review answers
"what is due". They should not be merged, but the Progress page should not show
the same lesson prominently in both on the same day.

---

# Backlog

Roughly in order of value per unit of work.

## Response time per question

Accuracy hides a lot. A child who answers `7 × 8` correctly after six seconds
has computed it, not memorised it — and that difference is the whole point of
fluency practice. Recording milliseconds per attempt would let the dashboard
surface *slow* facts, not just wrong ones, and would sharpen Stage 2 above.

One extra column on `attempts`, plus a timestamp when each question is
displayed. Small change, opens up a lot.

## Number bonds (ป.1)

`7 + ? = 10`, `? + 4 = 10`. The foundation of mental arithmetic, and missing
entirely. Children who know their bonds to ten stop counting on fingers. New
lesson module, follows the existing pattern.

## Missing-number questions generally

`12 − ? = 5` builds much stronger number sense than always solving
left-to-right. Reuses existing generators — mostly a matter of choosing which
slot to blank.

## Single times-table drills

Practising only the 7× table is a different exercise from mixed multiplication,
and it is how tables actually get learned. The speed quiz is mixed-only today;
this would be a picker for which table.

## Printable worksheet

The เรียงข้อ layout already *is* a worksheet. A print stylesheet would let a
parent print 100 questions for the kitchen table. Hide the chrome, force black
on white, page-break between rows. Perhaps an hour's work.

## Adaptive number ranges

Nudge the range up when accuracy stays above ~90% and down below ~60%, so
difficulty stays in the zone where learning happens instead of being fixed
forever. Needs a per-lesson difficulty level stored alongside the review box.

## Considered and rejected

- **Energy / lives that gate play.** Blocking a child who wants to practise
  more is backwards for a learning app, and it only earns anything if you sell
  refills — the least friendly thing possible in a children's app. A lives
  *challenge mode* in the speed quiz is fine; a tax on practice is not.
- **Ads.** At this scale it earns cents per year, children's content is heavily
  regulated (COPPA / GDPR-K / PDPA), personalised ads are not permitted, and
  AdSense is unlikely to approve a `github.io` subdomain. The UX cost is exactly
  what the app is trying to avoid. A paid classroom tier is the better route if
  it ever grows.
- **Two-player race mode and audio read-aloud.** A lot of work for narrow
  benefit; the ป.1 audience can already read numbers.
