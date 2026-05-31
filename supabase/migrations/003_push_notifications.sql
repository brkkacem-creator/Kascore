-- =====================================================
-- KASCORE — Migration 003: Push notifications
-- =====================================================

-- Push notification tokens (FCM / APNs)
create table if not exists public.push_tokens (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  token       text not null unique,
  platform    text not null check (platform in ('android', 'ios', 'web')),
  created_at  timestamptz default now() not null,
  last_seen   timestamptz default now() not null
);

create index on public.push_tokens (user_id);
create index on public.push_tokens (platform);

-- RLS
alter table public.push_tokens enable row level security;

create policy "Users manage their own tokens"
  on public.push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notification log
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null, -- 'match_start', 'result_updated', 'rank_changed'
  title       text not null,
  body        text not null,
  data        jsonb,
  sent_at     timestamptz default now() not null,
  read_at     timestamptz
);

create index on public.notifications (user_id, sent_at desc);

alter table public.notifications enable row level security;

create policy "Users see their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Service role inserts notifications"
  on public.notifications for insert
  using (true)
  with check (true);

-- Add is_admin column to profiles if missing
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='profiles' and column_name='is_admin'
  ) then
    alter table public.profiles add column is_admin boolean default false;
  end if;
end $$;

-- Function to notify on match result update
create or replace function public.notify_match_result()
returns trigger language plpgsql security definer as $$
begin
  -- Only fire when match transitions to 'finished'
  if OLD.status != 'finished' and NEW.status = 'finished' then
    -- Insert notification for all users who predicted this match
    insert into public.notifications (user_id, type, title, body, data)
    select
      p.user_id,
      'result_updated',
      'Résultat : ' ||
        (select name from public.teams where id = NEW.home_team_id) || ' ' ||
        COALESCE(NEW.home_score::text, '?') || '–' ||
        COALESCE(NEW.away_score::text, '?') || ' ' ||
        (select name from public.teams where id = NEW.away_team_id),
      case
        when p.points = 3 then '🎯 Score exact ! +3 points'
        when p.points = 1 then '✓ Bon résultat ! +1 point'
        else '✗ Raté cette fois...'
      end,
      jsonb_build_object(
        'match_id', NEW.id,
        'points', p.points,
        'url', '/pronostics'
      )
    from public.predictions p
    where p.match_id = NEW.id
    and p.points is not null;
  end if;
  return NEW;
end;
$$;

create trigger match_result_notify
  after update on public.matches
  for each row execute function public.notify_match_result();

-- Enable realtime on notifications
alter publication supabase_realtime add table public.notifications;
