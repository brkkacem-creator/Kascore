-- =====================================================
-- KASCORE — Supabase Migration
-- Coupe du Monde FIFA 2026
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for search

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  username     text not null,
  avatar_url   text,
  favorite_team text,
  is_admin     boolean default false,
  total_points integer default 0 not null,
  exact_scores integer default 0 not null,
  correct_results integer default 0 not null,
  total_predictions integer default 0 not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Teams
create table public.teams (
  id           uuid primary key default uuid_generate_v4(),
  api_id       integer unique,
  name         text not null,
  short_name   text not null,
  flag_emoji   text not null,
  group_id     text,  -- 'A'..'L'
  created_at   timestamptz default now() not null
);

-- Matches
create table public.matches (
  id           uuid primary key default uuid_generate_v4(),
  api_id       integer unique,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_score   integer,
  away_score   integer,
  scheduled_at timestamptz not null,
  status       text not null default 'upcoming'
               check (status in ('upcoming','live','finished','postponed')),
  phase        text not null default 'GROUP_STAGE'
               check (phase in ('GROUP_STAGE','ROUND_OF_32','ROUND_OF_16',
                                'QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL')),
  group_id     text,
  stadium      text not null default '',
  city         text not null default '',
  minute       integer,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Predictions
create table public.predictions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  match_id     uuid references public.matches(id) on delete cascade not null,
  home_score   integer not null check (home_score >= 0),
  away_score   integer not null check (away_score >= 0),
  points       integer check (points in (0, 1, 3)),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  unique (user_id, match_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

create index on public.matches (scheduled_at);
create index on public.matches (status);
create index on public.matches (phase);
create index on public.matches (group_id);
create index on public.predictions (user_id);
create index on public.predictions (match_id);
create index on public.predictions (user_id, points);

-- Full-text search on teams
create index on public.teams using gin (name gin_trgm_ops);

-- =====================================================
-- LEADERBOARD VIEW
-- =====================================================

create or replace view public.leaderboard as
select
  p.id              as user_id,
  p.username,
  p.avatar_url,
  p.total_points,
  p.exact_scores,
  p.correct_results,
  p.total_predictions,
  row_number() over (order by p.total_points desc, p.exact_scores desc) as rank
from public.profiles p
where p.total_predictions > 0
order by p.total_points desc, p.exact_scores desc;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles    enable row level security;
alter table public.teams       enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;

-- Profiles: users see everyone, edit only their own
create policy "Profiles are viewable by all"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Teams: public read
create policy "Teams are public"
  on public.teams for select using (true);

create policy "Admins can manage teams"
  on public.teams for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Matches: public read
create policy "Matches are public"
  on public.matches for select using (true);

create policy "Admins can manage matches"
  on public.matches for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Predictions: own only, or admin
create policy "Users see their own predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

create policy "Users can insert predictions"
  on public.predictions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.status not in ('finished', 'live')
    )
  );

create policy "Users can update their predictions"
  on public.predictions for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.status not in ('finished', 'live')
    )
  );

create policy "Admins can update predictions (scoring)"
  on public.predictions for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Leaderboard: public
create policy "Leaderboard is public"
  on public.profiles for select using (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_matches
  before update on public.matches
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_predictions
  before update on public.predictions
  for each row execute function public.handle_updated_at();

-- Realtime: enable on key tables
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.predictions;
alter publication supabase_realtime add table public.profiles;
