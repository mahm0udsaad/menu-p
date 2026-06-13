-- ----------------------------------------------------------------------------
-- Allow 'url' as a menu import source (digital menu links: direct PDF/image
-- links or a restaurant's own web menu rendered to PDF).
-- ----------------------------------------------------------------------------
alter table public.menu_import_jobs
  drop constraint if exists menu_import_jobs_source_type_check;

alter table public.menu_import_jobs
  add constraint menu_import_jobs_source_type_check
  check (source_type in ('pdf','image','url'));
