-- Skillora Internship Portal - Supabase PostgreSQL Schema
-- Run this script once in your Supabase Dashboard -> SQL Editor to create all tables and policies.

-- 1. Students Table
create table if not exists public.students (
  id text primary key,
  full_name text not null,
  email text unique not null,
  mobile text not null,
  college text not null,
  course text not null,
  semester text not null,
  domain text not null,
  password text not null,
  registration_date timestamptz not null default now(),
  internship_start_date text not null,
  internship_end_date text not null,
  internship_duration text not null,
  project_deadline text not null,
  offer_letter_date text not null,
  offer_letter_number text not null,
  offer_letter_status text not null default 'GENERATED',
  internship_status text not null default 'Offer Letter Issued'
);

-- 2. Offer Letters History Table
create table if not exists public.offer_letters (
  id text primary key,
  offer_letter_number text not null,
  version integer not null default 1,
  student_id text not null references public.students(id) on delete cascade,
  student_name text not null,
  domain text not null,
  issue_date text not null,
  created_at timestamptz not null default now(),
  is_current boolean not null default true,
  note text
);

-- 3. Internship Change Logs Table
create table if not exists public.internship_change_logs (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  field_changed text not null,
  previous_value text not null,
  new_value text not null,
  changed_at timestamptz not null default now(),
  action_description text not null
);

-- 4. Student Notifications Table
create table if not exists public.student_notifications (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  category text not null
);

-- 5. Internship Tasks Table
create table if not exists public.internship_tasks (
  id text primary key,
  task_number integer not null,
  domain text not null,
  title text not null,
  description text not null,
  guidelines jsonb not null default '[]'::jsonb,
  deadline text not null,
  created_at timestamptz not null default now(),
  assigned_student_ids jsonb not null default '[]'::jsonb
);

-- 6. Task Submissions Table
create table if not exists public.task_submissions (
  id text primary key,
  task_id text not null references public.internship_tasks(id) on delete cascade,
  student_id text not null references public.students(id) on delete cascade,
  status text not null,
  project_description text not null default '',
  file_name text,
  file_size text,
  file_type text,
  started_at timestamptz,
  submitted_at timestamptz,
  admin_feedback text,
  reviewed_at timestamptz
);

-- 7. Capstone Project Submissions Table
create table if not exists public.project_submissions (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  student_name text not null,
  domain text not null,
  project_title text not null,
  project_description text not null,
  file_name text not null,
  file_size text not null,
  file_type text not null,
  project_url text,
  submission_date timestamptz not null default now(),
  status text not null,
  admin_feedback text,
  reviewed_at timestamptz
);

-- 8. Certificates Table
create table if not exists public.certificates (
  id text primary key,
  certificate_id text unique not null,
  student_id text not null references public.students(id) on delete cascade,
  student_name text not null,
  domain text not null,
  completion_date text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'ISSUED'
);

-- 9. Letters of Recommendation (LOR) Table
create table if not exists public.lors (
  id text primary key,
  lor_id text unique not null,
  student_id text not null references public.students(id) on delete cascade,
  student_name text not null,
  domain text not null,
  completion_date text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'ISSUED'
);

-- Useful Indexes
create index if not exists idx_students_email on public.students(email);
create index if not exists idx_offer_letters_student_id on public.offer_letters(student_id);
create index if not exists idx_change_logs_student_id on public.internship_change_logs(student_id);
create index if not exists idx_notifications_student_id on public.student_notifications(student_id);
create index if not exists idx_task_submissions_student_id on public.task_submissions(student_id);
create index if not exists idx_project_submissions_student_id on public.project_submissions(student_id);

-- Row Level Security (RLS) Policies for Frontend Publishable Client Access
alter table public.students enable row level security;
alter table public.offer_letters enable row level security;
alter table public.internship_change_logs enable row level security;
alter table public.student_notifications enable row level security;
alter table public.internship_tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.project_submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.lors enable row level security;

drop policy if exists "skillora_public_all_students" on public.students;
create policy "skillora_public_all_students" on public.students for all using (true) with check (true);

drop policy if exists "skillora_public_all_offer_letters" on public.offer_letters;
create policy "skillora_public_all_offer_letters" on public.offer_letters for all using (true) with check (true);

drop policy if exists "skillora_public_all_change_logs" on public.internship_change_logs;
create policy "skillora_public_all_change_logs" on public.internship_change_logs for all using (true) with check (true);

drop policy if exists "skillora_public_all_notifications" on public.student_notifications;
create policy "skillora_public_all_notifications" on public.student_notifications for all using (true) with check (true);

drop policy if exists "skillora_public_all_tasks" on public.internship_tasks;
create policy "skillora_public_all_tasks" on public.internship_tasks for all using (true) with check (true);

drop policy if exists "skillora_public_all_task_submissions" on public.task_submissions;
create policy "skillora_public_all_task_submissions" on public.task_submissions for all using (true) with check (true);

drop policy if exists "skillora_public_all_project_submissions" on public.project_submissions;
create policy "skillora_public_all_project_submissions" on public.project_submissions for all using (true) with check (true);

drop policy if exists "skillora_public_all_certificates" on public.certificates;
create policy "skillora_public_all_certificates" on public.certificates for all using (true) with check (true);

drop policy if exists "skillora_public_all_lors" on public.lors;
create policy "skillora_public_all_lors" on public.lors for all using (true) with check (true);
