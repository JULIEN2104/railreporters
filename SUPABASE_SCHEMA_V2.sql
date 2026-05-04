-- =====================================================
-- RailReporters — Schéma SQL V2 communautaire
-- Version brouillon technique
-- =====================================================

-- IMPORTANT :
-- Ce fichier prépare la future base Supabase de RailReporters.
-- Il ne doit pas encore être exécuté sans vérification finale.
-- La V1.2 actuelle du site reste stable et indépendante.

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- 2. TABLE PROFILES
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  bio text,
  country text,
  city text,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  is_banned boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.profiles is 'Profils publics des utilisateurs RailReporters.';

-- =====================================================
-- 3. TABLE REPORTS
-- =====================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  train text not null,
  operator text not null,

  departure_station text not null,
  departure_time time,
  arrival_station text not null,
  arrival_time time,

  travel_date date not null,
  travel_class text,

  cover_photo_url text,
  rating integer not null check (rating between 1 and 5),
  conclusion text not null,

  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'deleted')),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.reports is 'Reports ferroviaires publiés par les membres.';

-- =====================================================
-- 4. TABLE REPORT_SECTIONS
-- =====================================================

create table if not exists public.report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,

  section_type text not null check (
    section_type in (
      'station_arrival',
      'station_experience',
      'boarding',
      'onboard',
      'services',
      'arrival',
      'conclusion'
    )
  ),

  title text not null,
  content text,
  position integer not null default 0,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.report_sections is 'Sections détaillées des reports RailReporters.';

-- =====================================================
-- 5. TABLE REPORT_PHOTOS
-- =====================================================

create table if not exists public.report_photos (
  id uuid primary key default gen_random_uuid(),

  report_id uuid not null references public.reports(id) on delete cascade,
  section_id uuid references public.report_sections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  photo_url text not null,
  caption text,
  position integer not null default 0,

  created_at timestamp with time zone not null default now()
);

comment on table public.report_photos is 'Photos liées aux reports et aux sections.';

-- =====================================================
-- 6. TABLE COMMENTS
-- =====================================================

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),

  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,

  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.comments is 'Commentaires publiés sous les reports.';

-- =====================================================
-- 7. TABLE MODERATION_REPORTS
-- =====================================================

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),

  reported_by uuid references public.profiles(id) on delete set null,

  content_type text not null check (content_type in ('report', 'comment', 'photo', 'profile')),
  content_id uuid not null,

  reason text not null,
  details text,

  status text not null default 'pending' check (status in ('pending', 'reviewed', 'rejected', 'action_taken')),
  admin_note text,

  created_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone
);

comment on table public.moderation_reports is 'Signalements de contenus par les utilisateurs.';

-- =====================================================
-- 8. TABLE USER_BANS
-- =====================================================

create table if not exists public.user_bans (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id) on delete cascade,
  banned_by uuid references public.profiles(id) on delete set null,

  reason text not null,
  starts_at timestamp with time zone not null default now(),
  ends_at timestamp with time zone,
  is_permanent boolean not null default false,

  created_at timestamp with time zone not null default now()
);

comment on table public.user_bans is 'Bannissements temporaires ou définitifs.';

-- =====================================================
-- 9. INDEXES
-- =====================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_travel_date on public.reports(travel_date);
create index if not exists idx_report_sections_report_id on public.report_sections(report_id);
create index if not exists idx_report_photos_report_id on public.report_photos(report_id);
create index if not exists idx_report_photos_section_id on public.report_photos(section_id);
create index if not exists idx_comments_report_id on public.comments(report_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_moderation_reports_status on public.moderation_reports(status);
create index if not exists idx_user_bans_user_id on public.user_bans(user_id);

-- =====================================================
-- 10. FONCTION UPDATED_AT
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

drop trigger if exists set_report_sections_updated_at on public.report_sections;
create trigger set_report_sections_updated_at
before update on public.report_sections
for each row
execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();

-- =====================================================
-- 11. CRÉATION AUTOMATIQUE DU PROFIL APRÈS INSCRIPTION
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =====================================================
-- 12. FONCTIONS DE RÔLES
-- =====================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_banned = false
  );
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('moderator', 'admin')
      and is_banned = false
  );
$$;

-- =====================================================
-- 13. ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_sections enable row level security;
alter table public.report_photos enable row level security;
alter table public.comments enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.user_bans enable row level security;

-- =====================================================
-- 14. POLICIES PROFILES
-- =====================================================

create policy "Profiles are readable by everyone"
on public.profiles
for select
using (true);

create policy "Users can update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update all profiles"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- 15. POLICIES REPORTS
-- =====================================================

create policy "Published reports are readable by everyone"
on public.reports
for select
using (status = 'published');

create policy "Users can read their own reports"
on public.reports
for select
using (user_id = auth.uid());

create policy "Users can create their own reports"
on public.reports
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_banned = false
  )
);

create policy "Users can update their own reports"
on public.reports
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own draft reports"
on public.reports
for delete
using (
  user_id = auth.uid()
  and status = 'draft'
);

create policy "Moderators and admins can manage reports"
on public.reports
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- =====================================================
-- 16. POLICIES REPORT_SECTIONS
-- =====================================================

create policy "Sections of published reports are readable"
on public.report_sections
for select
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_sections.report_id
      and reports.status = 'published'
  )
);

create policy "Authors can manage their report sections"
on public.report_sections
for all
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_sections.report_id
      and reports.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.reports
    where reports.id = report_sections.report_id
      and reports.user_id = auth.uid()
  )
);

create policy "Moderators and admins can manage report sections"
on public.report_sections
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- =====================================================
-- 17. POLICIES REPORT_PHOTOS
-- =====================================================

create policy "Photos of published reports are readable"
on public.report_photos
for select
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_photos.report_id
      and reports.status = 'published'
  )
);

create policy "Authors can manage their report photos"
on public.report_photos
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Moderators and admins can manage report photos"
on public.report_photos
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- =====================================================
-- 18. POLICIES COMMENTS
-- =====================================================

create policy "Published comments are readable on published reports"
on public.comments
for select
using (
  status = 'published'
  and exists (
    select 1
    from public.reports
    where reports.id = comments.report_id
      and reports.status = 'published'
  )
);

create policy "Users can create comments"
on public.comments
for insert
with check (
  user_id = auth.uid()
  and status = 'published'
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_banned = false
  )
);

create policy "Users can update their own comments"
on public.comments
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own comments"
on public.comments
for delete
using (user_id = auth.uid());

create policy "Moderators and admins can manage comments"
on public.comments
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- =====================================================
-- 19. POLICIES MODERATION_REPORTS
-- =====================================================

create policy "Users can create moderation reports"
on public.moderation_reports
for insert
with check (reported_by = auth.uid());

create policy "Users can read their own moderation reports"
on public.moderation_reports
for select
using (reported_by = auth.uid());

create policy "Moderators and admins can manage moderation reports"
on public.moderation_reports
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- =====================================================
-- 20. POLICIES USER_BANS
-- =====================================================

create policy "Moderators and admins can read bans"
on public.user_bans
for select
using (public.is_moderator_or_admin());

create policy "Admins can manage bans"
on public.user_bans
for all
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- 21. STORAGE — À PRÉPARER PLUS TARD
-- =====================================================

-- Buckets envisagés :
-- - report-photos
-- - profile-avatars
--
-- Les règles de Storage seront préparées dans une étape séparée.
-- Supabase Storage utilise aussi des politiques d’accès pour contrôler
-- les uploads, lectures et suppressions.
--
-- À ne pas exécuter maintenant sans validation :
--
-- insert into storage.buckets (id, name, public)
-- values ('report-photos', 'report-photos', true)
-- on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
-- values ('profile-avatars', 'profile-avatars', true)
-- on conflict (id) do nothing;

-- =====================================================
-- FIN DU SCHÉMA V2 BROUILLON
-- =====================================================
