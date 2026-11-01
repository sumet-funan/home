-- The final quiz now covers every primary grade.

alter table public.final_quiz_results
  drop constraint final_quiz_results_grade_check;

alter table public.final_quiz_results
  add constraint final_quiz_results_grade_check
  check (grade in ('p1', 'p2', 'p3', 'p4', 'p5', 'p6'));
