-- Run once in your project's Supabase SQL Editor.
-- A compact private snapshot per user; revision checks prevent stale overwrites.
create table if not exists public.quest_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.quest_state enable row level security;
revoke all on table public.quest_state from anon;
grant select, insert, update on table public.quest_state to authenticated;
create policy "Read own quest" on public.quest_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own quest" on public.quest_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own quest" on public.quest_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.validate_quest_revision() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.user_id <> old.user_id then raise exception 'Cannot change owner'; end if;
  if new.revision <> old.revision + 1 then raise exception 'Invalid revision'; end if;
  new.updated_at = now();
  return new;
end;
$$;
create trigger quest_revision_before_update before update on public.quest_state for each row execute function public.validate_quest_revision();
