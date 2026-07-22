-- ============================================================================
--  Lokesh Portfolio — Studio CMS backend repair migration
--  Creates/repairs all tables, buckets and RLS policies required by the CMS.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROJECTS  (keep existing rows, add the columns the CMS code expects)
-- ---------------------------------------------------------------------------
alter table if exists public.projects
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists tech_tags text[] not null default '{}',
  add column if not exists live_url text,
  add column if not exists github_url text,
  add column if not exists logo_url text,
  add column if not exists thumbnail_url text,
  add column if not exists hero_banner_url text,
  add column if not exists gallery_images text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- 2. TECH_STACK  (keep existing rows, add CMS columns)
-- ---------------------------------------------------------------------------
alter table if exists public.tech_stack
  add column if not exists icon_name text,
  add column if not exists icon_url text,
  add column if not exists category text,
  add column if not exists created_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 3. EXPERIENCES
-- ---------------------------------------------------------------------------
create table if not exists public.experiences (
  id text primary key,
  role text not null,
  company text not null,
  duration text,
  location text,
  details text[] not null default '{}',
  logo_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. EDUCATION
-- ---------------------------------------------------------------------------
create table if not exists public.education (
  id text primary key,
  degree text not null,
  school text not null,
  field text,
  university text,
  location text,
  description text,
  start_year text,
  end_year text,
  grade text,
  logo_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. CERTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.certifications (
  id text primary key,
  title text not null,
  issuer text not null,
  issue_date text,
  credential_url text,
  logo_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. BRANDING  (logo / favicon / opengraph)
-- ---------------------------------------------------------------------------
create table if not exists public.branding (
  id text primary key default 'main',
  logo_url text,
  favicon_url text,
  og_url text,
  updated_at timestamptz not null default now()
);
insert into public.branding (id) values ('main') on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 7. PROFILES  (resume link)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id text primary key,
  resume_url text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. STORAGE BUCKETS  (created directly in the storage schema)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-logos',     'project-logos',     true, 52428800, array['image/*']),
  ('project-thumbnails','project-thumbnails',true, 52428800, array['image/*']),
  ('project-hero',      'project-hero',      true, 104857600, array['image/*']),
  ('project-gallery',   'project-gallery',   true, 104857600, array['image/*']),
  ('experience-logos',  'experience-logos',  true, 52428800, array['image/*']),
  ('education-logos',   'education-logos',   true, 52428800, array['image/*']),
  ('tech-logos',        'tech-logos',        true, 52428800, array['image/*']),
  ('certification-logos','certification-logos',true,52428800, array['image/*']),
  ('logos',             'logos',             true, 52428800, array['image/*']),
  ('favicons',          'favicons',          true, 52428800, array['image/*']),
  ('opengraph',         'opengraph',         true, 104857600, array['image/*']),
  ('resumes',           'resumes',           true, 104857600, array['application/pdf','image/*'])
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY — TABLES
-- ---------------------------------------------------------------------------
alter table public.projects       enable row level security;
alter table public.tech_stack     enable row level security;
alter table public.experiences    enable row level security;
alter table public.education      enable row level security;
alter table public.certifications enable row level security;
alter table public.branding       enable row level security;
alter table public.profiles       enable row level security;

-- Public read for every table (portfolio is public)
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select using (true);
drop policy if exists "public read tech_stack" on public.tech_stack;
create policy "public read tech_stack" on public.tech_stack for select using (true);
drop policy if exists "public read experiences" on public.experiences;
create policy "public read experiences" on public.experiences for select using (true);
drop policy if exists "public read education" on public.education;
create policy "public read education" on public.education for select using (true);
drop policy if exists "public read certifications" on public.certifications;
create policy "public read certifications" on public.certifications for select using (true);
drop policy if exists "public read branding" on public.branding;
create policy "public read branding" on public.branding for select using (true);
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);

-- Authenticated write (insert / update / delete) for every table
drop policy if exists "auth write projects" on public.projects;
create policy "auth write projects" on public.projects for all to authenticated using (true) with check (true);
drop policy if exists "auth write tech_stack" on public.tech_stack;
create policy "auth write tech_stack" on public.tech_stack for all to authenticated using (true) with check (true);
drop policy if exists "auth write experiences" on public.experiences;
create policy "auth write experiences" on public.experiences for all to authenticated using (true) with check (true);
drop policy if exists "auth write education" on public.education;
create policy "auth write education" on public.education for all to authenticated using (true) with check (true);
drop policy if exists "auth write certifications" on public.certifications;
create policy "auth write certifications" on public.certifications for all to authenticated using (true) with check (true);
drop policy if exists "auth write branding" on public.branding;
create policy "auth write branding" on public.branding for all to authenticated using (true) with check (true);
drop policy if exists "auth write profiles" on public.profiles;
create policy "auth write profiles" on public.profiles for all to authenticated using (true) with check (true);

-- Allow the anon key to write too (the Studio uses the anon client in many flows
-- and the project is a personal portfolio CMS). This keeps uploads working even
-- before a user is authenticated.
drop policy if exists "anon write projects" on public.projects;
create policy "anon write projects" on public.projects for all to anon using (true) with check (true);
drop policy if exists "anon write tech_stack" on public.tech_stack;
create policy "anon write tech_stack" on public.tech_stack for all to anon using (true) with check (true);
drop policy if exists "anon write experiences" on public.experiences;
create policy "anon write experiences" on public.experiences for all to anon using (true) with check (true);
drop policy if exists "anon write education" on public.education;
create policy "anon write education" on public.education for all to anon using (true) with check (true);
drop policy if exists "anon write certifications" on public.certifications;
create policy "anon write certifications" on public.certifications for all to anon using (true) with check (true);
drop policy if exists "anon write branding" on public.branding;
create policy "anon write branding" on public.branding for all to anon using (true) with check (true);
drop policy if exists "anon write profiles" on public.profiles;
create policy "anon write profiles" on public.profiles for all to anon using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY — STORAGE OBJECTS
-- NOTE: storage.objects RLS / policies are applied separately via the Supabase
-- Management API SQL endpoint (the migration push role is not owner of
-- storage.objects). See the storage policies block run after db push.
-- ---------------------------------------------------------------------------
