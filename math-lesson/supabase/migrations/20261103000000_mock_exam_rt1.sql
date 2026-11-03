-- RT ป.1, the reading test, joins the practice papers. Its score is out of 100
-- like the others, so only the list of papers changes.
alter table public.mock_exam_results drop constraint mock_exam_results_exam_check;
alter table public.mock_exam_results add constraint mock_exam_results_exam_check
  check (exam in ('nt3', 'onet6', 'rt1'));
