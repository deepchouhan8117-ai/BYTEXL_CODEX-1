create table if not exists public.student_datasets (
  id uuid primary key default gen_random_uuid(),
  dataset_name text not null unique,
  row_count integer not null default 0,
  payload jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_datasets_updated_at_idx
  on public.student_datasets (updated_at desc);

alter table public.student_datasets enable row level security;

drop policy if exists "Service role can manage student datasets"
  on public.student_datasets;

create policy "Service role can manage student datasets"
  on public.student_datasets
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Public can read student datasets"
  on public.student_datasets;
