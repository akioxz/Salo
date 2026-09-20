-- =========================================================================
-- SALO — Phase 1: Foundation Schema, RLS Policies, Secure Pairing RPCs
-- =========================================================================
-- Run this once in the Supabase SQL Editor (or via `supabase db push`
-- against a migration file). Idempotent where practical.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 0. EXTENSIONS
-- -------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- -------------------------------------------------------------------------
-- 1. TABLES
-- -------------------------------------------------------------------------

create table if not exists public.households (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  invite_code        text unique,          -- null once redeemed / never issued
  invite_expires_at  timestamptz           -- null when there is no active invite
);

create table if not exists public.household_members (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null check (role in ('family', 'ofw')),
  joined_at     timestamptz not null default now(),

  -- A household may never have two members with the same role.
  constraint household_role_unique unique (household_id, role),

  -- v1 design decision: pairing is permanent, so a person belongs to
  -- exactly one household, ever, for the lifetime of their account.
  constraint one_household_per_user unique (user_id)
);

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  author_id    uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('expense', 'need')),
  amount       numeric(12,2) check (amount is null or amount >= 0),
  category     text not null check (char_length(category) between 1 and 40),
  caption      text check (caption is null or char_length(caption) <= 500),
  photo_path   text, -- Supabase Storage object path, not a public URL
  created_at   timestamptz not null default now()
);

create table if not exists public.reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('heart', 'thanks')),
  created_at timestamptz not null default now(),

  -- one reaction of a given type per user per post (prevents spam-clicking)
  constraint reactions_unique unique (post_id, user_id, type)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- Helpful indexes for feed queries
create index if not exists idx_household_members_household on public.household_members(household_id);
create index if not exists idx_posts_household_created on public.posts(household_id, created_at desc);
create index if not exists idx_reactions_post on public.reactions(post_id);
create index if not exists idx_comments_post on public.comments(post_id, created_at);

-- -------------------------------------------------------------------------
-- 2. MAX-2-MEMBERS ENFORCEMENT (belt-and-suspenders alongside the RPC logic)
-- -------------------------------------------------------------------------

create or replace function public.enforce_household_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.household_members where household_id = new.household_id) >= 2 then
    raise exception 'Household already has 2 members';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_household_member_limit on public.household_members;
create trigger trg_household_member_limit
  before insert on public.household_members
  for each row execute function public.enforce_household_member_limit();

-- -------------------------------------------------------------------------
-- 3. RLS HELPER FUNCTION
-- -------------------------------------------------------------------------
-- SECURITY DEFINER so it can read household_members even though RLS on
-- that table would otherwise block a member from seeing rows other than
-- their own during policy evaluation. search_path is pinned to prevent
-- schema-hijacking.

create or replace function public.is_household_member(p_household_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = p_household_id
      and user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------------------------
-- 4. ENABLE RLS (deny-by-default; no policy = no access)
-- -------------------------------------------------------------------------

alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.posts             enable row level security;
alter table public.reactions         enable row level security;
alter table public.comments          enable row level security;

-- -------------------------------------------------------------------------
-- 5. POLICIES
-- -------------------------------------------------------------------------

-- households: a user may only SELECT the household they belong to.
-- No INSERT/UPDATE/DELETE policy exists for regular authenticated users —
-- those actions only happen inside SECURITY DEFINER RPCs below.
drop policy if exists "households_select_own" on public.households;
create policy "households_select_own"
  on public.households for select
  using (public.is_household_member(id));

-- household_members: a user may SELECT rows for their own household
-- (i.e. see their partner's membership row), never any other household.
drop policy if exists "household_members_select_own" on public.household_members;
create policy "household_members_select_own"
  on public.household_members for select
  using (public.is_household_member(household_id));
-- No insert/update/delete policy: membership is only ever written by
-- create_household() / join_household() below.

-- posts: full CRUD scoped strictly to household membership, and authors
-- may only ever write posts as themselves.
drop policy if exists "posts_select" on public.posts;
create policy "posts_select"
  on public.posts for select
  using (public.is_household_member(household_id));

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert"
  on public.posts for insert
  with check (
    public.is_household_member(household_id)
    and author_id = auth.uid()
  );

drop policy if exists "posts_update" on public.posts;
create policy "posts_update"
  on public.posts for update
  using (public.is_household_member(household_id) and author_id = auth.uid())
  with check (public.is_household_member(household_id) and author_id = auth.uid());

drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete"
  on public.posts for delete
  using (public.is_household_member(household_id) and author_id = auth.uid());

-- reactions: scoped via the parent post's household.
drop policy if exists "reactions_select" on public.reactions;
create policy "reactions_select"
  on public.reactions for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = reactions.post_id
        and public.is_household_member(p.household_id)
    )
  );

drop policy if exists "reactions_insert" on public.reactions;
create policy "reactions_insert"
  on public.reactions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = reactions.post_id
        and public.is_household_member(p.household_id)
    )
  );

drop policy if exists "reactions_delete" on public.reactions;
create policy "reactions_delete"
  on public.reactions for delete
  using (user_id = auth.uid());

-- comments: scoped via the parent post's household.
drop policy if exists "comments_select" on public.comments;
create policy "comments_select"
  on public.comments for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and public.is_household_member(p.household_id)
    )
  );

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert"
  on public.comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and public.is_household_member(p.household_id)
    )
  );

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete"
  on public.comments for delete
  using (author_id = auth.uid());

-- -------------------------------------------------------------------------
-- 6. SECURE PAIRING RPCs
-- -------------------------------------------------------------------------

-- create_household: called by the FIRST user (the household's founder).
-- Creates the household, adds the caller as its first member with the
-- role they chose, and issues a single-use, cryptographically random,
-- time-limited invite code.
create or replace function public.create_household(p_role text)
returns table (household_id uuid, invite_code text, invite_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_code text;
begin
  if p_role not in ('family', 'ofw') then
    raise exception 'Invalid role: must be family or ofw';
  end if;

  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'You already belong to a household';
  end if;

  -- 128 bits of entropy, hex-encoded (URL-safe, unambiguous).
  v_code := encode(extensions.gen_random_bytes(16), 'hex');

  insert into public.households (invite_code, invite_expires_at)
  values (v_code, now() + interval '48 hours')
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, auth.uid(), p_role);

  return query select v_household_id, v_code, (now() + interval '48 hours');
end;
$$;

-- join_household: called by the SECOND user with the invite code.
-- Validates the code, assigns the opposite role, and immediately
-- nullifies the code so it can never be reused.
create or replace function public.join_household(p_invite_code text)
returns table (household_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household record;
  v_existing_role text;
  v_new_role text;
begin
  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'You already belong to a household';
  end if;

  -- Lock the row so two simultaneous joins can't both succeed.
  select * into v_household
  from public.households
  where invite_code = p_invite_code
    and invite_expires_at > now()
  for update;

  if not found then
    raise exception 'Invalid or expired invite code';
  end if;

  if (select count(*) from public.household_members where household_id = v_household.id) >= 2 then
    raise exception 'Household is already full';
  end if;

  select hm.role into v_existing_role
  from public.household_members hm
  where hm.household_id = v_household.id
  limit 1;

  v_new_role := case when v_existing_role = 'family' then 'ofw' else 'family' end;

  insert into public.household_members (household_id, user_id, role)
  values (v_household.id, auth.uid(), v_new_role);

  -- Single-use: nullify immediately so the code can never be redeemed again.
  update public.households
  set invite_code = null, invite_expires_at = null
  where id = v_household.id;

  return query select v_household.id, v_new_role;
end;
$$;

-- -------------------------------------------------------------------------
-- 7. LOCK DOWN EXECUTE GRANTS
-- -------------------------------------------------------------------------
-- Only logged-in users may call the pairing RPCs; anonymous cannot.
revoke all on function public.create_household(text) from public;
revoke all on function public.join_household(text) from public;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;

-- is_household_member is only meant to be used inside policies, but
-- authenticated users calling it directly is harmless (it only returns
-- a boolean about their own membership), so default grants are fine.
