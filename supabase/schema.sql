-- CampusConnect database schema
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'TECHNOLOGY',
  description text not null default '',
  starts_at timestamptz,
  venue text not null default 'Campus',
  capacity integer not null default 50 check (capacity > 0),
  registered_count integer not null default 0,
  color text not null default 'blue',
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table public.events enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "Events are visible to everyone" on public.events;
create policy "Events are visible to everyone" on public.events for select using (true);

drop policy if exists "Users can view their registrations" on public.registrations;
create policy "Users can view their registrations" on public.registrations for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can register themselves" on public.registrations;
create policy "Users can register themselves" on public.registrations for insert to authenticated with check (auth.uid() = user_id);

-- Seed example campus events (safe to run more than once)
insert into public.events(title,category,description,starts_at,venue,capacity,registered_count,color)
select * from (values
 ('Line Follower Challenge','TECHNOLOGY','Build, test and race an autonomous robot through a challenging track. Open to all students.','2026-11-12 10:00:00+05:30'::timestamptz,'Innovation Lab',60,34,'blue'),
 ('Design Sprint','WORKSHOP','A collaborative workshop to turn ideas into thoughtful product experiences.','2026-11-14 11:30:00+05:30'::timestamptz,'Design Studio',40,22,'green'),
 ('Campus Sports Meet','SPORTS','Bring your team spirit and take part in a day of friendly campus competition.','2026-11-16 08:00:00+05:30'::timestamptz,'Main Ground',120,87,'amber'),
 ('AI & Innovation Talk','SEMINAR','Explore practical applications of AI and meet people building the future.','2026-11-18 14:00:00+05:30'::timestamptz,'Auditorium',100,61,'purple')
) as v(title,category,description,starts_at,venue,capacity,registered_count,color)
where not exists (select 1 from public.events e where e.title=v.title);
