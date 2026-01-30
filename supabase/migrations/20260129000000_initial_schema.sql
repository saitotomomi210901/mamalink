-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: MamaLink の基本テーブル構造と RLS ポリシーの作成
-- Tables: profiles, posts, matches, chats, reviews
-- ============================================

-- 1. profiles テーブル（ユーザー情報）
create table public.profiles (
  id text primary key, -- Clerk の user_id を使用
  display_name text not null,
  avatar_url text,
  is_kyc_verified boolean default false not null,
  trust_score int default 100 not null,
  bio text,
  children_info jsonb,
  area text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'アプリケーションのユーザー情報を管理。Clerk ユーザー ID と同期。';

-- profiles の RLS 有効化
alter table public.profiles enable row level security;

-- profiles ポリシー: 全認証済みユーザーがプロフィールを閲覧可能
create policy "profiles_select_all" on public.profiles
  for select to authenticated
  using (true);

-- profiles ポリシー: ユーザーは自分のプロフィールのみ更新可能
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.jwt() ->> 'sub')
  with check (id = auth.jwt() ->> 'sub');


-- 2. posts テーブル（投稿情報）
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id text references public.profiles(id) on delete cascade not null,
  mode text check (mode in ('asobo', 'oshiete', 'tasukete')) not null,
  title text not null,
  content text not null,
  location_name text,
  location_point geography(point),
  scheduled_at timestamptz,
  max_participants int default 1 not null,
  status text default 'open' check (status in ('open', 'closed')) not null,
  created_at timestamptz default now() not null
);

comment on table public.posts is '募集投稿（あそぼ・おしえて・たすけて）を管理。';

-- posts の RLS 有効化
alter table public.posts enable row level security;

-- posts ポリシー: 全認証済みユーザーが閲覧可能
create policy "posts_select_all" on public.posts
  for select to authenticated
  using (true);

-- posts ポリシー: ユーザーは自分の投稿を作成・更新・削除可能
create policy "posts_insert_own" on public.posts
  for insert to authenticated
  with check (author_id = auth.jwt() ->> 'sub');

create policy "posts_update_own" on public.posts
  for update to authenticated
  using (author_id = auth.jwt() ->> 'sub');

create policy "posts_delete_own" on public.posts
  for delete to authenticated
  using (author_id = auth.jwt() ->> 'sub');


-- 3. matches テーブル（マッチング状態）
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id text references public.profiles(id) on delete cascade not null, -- 応募者 ID
  status text default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')) not null,
  created_at timestamptz default now() not null
);

comment on table public.matches is '投稿に対する応募とマッチング状態を管理。';

-- matches の RLS 有効化
alter table public.matches enable row level security;

-- matches ポリシー: 投稿作成者または応募者のみが閲覧可能
create policy "matches_select_related" on public.matches
  for select to authenticated
  using (
    user_id = auth.jwt() ->> 'sub' or 
    exists (
      select 1 from public.posts 
      where id = post_id and author_id = auth.jwt() ->> 'sub'
    )
  );

-- matches ポリシー: 認証済みユーザーは応募（INSERT）可能
create policy "matches_insert_own" on public.matches
  for insert to authenticated
  with check (user_id = auth.jwt() ->> 'sub');


-- 4. chats テーブル（メッセージ）
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id text references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

comment on table public.chats is 'マッチング後のチャットメッセージを管理。';

-- chats の RLS 有効化
alter table public.chats enable row level security;

-- chats ポリシー: マッチング関係者のみが閲覧・送信可能
create policy "chats_access_related" on public.chats
  for all to authenticated
  using (
    exists (
      select 1 from public.matches
      where id = match_id and (
        user_id = auth.jwt() ->> 'sub' or 
        exists (
          select 1 from public.posts 
          where id = public.matches.post_id and author_id = auth.jwt() ->> 'sub'
        )
      )
    )
  );


-- 5. reviews テーブル（相互レビュー）
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  reviewer_id text references public.profiles(id) on delete cascade not null,
  reviewee_id text references public.profiles(id) on delete cascade not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now() not null
);

comment on table public.reviews is '完了後の相互レビューと評価を管理。';

-- reviews の RLS 有効化
alter table public.reviews enable row level security;

-- reviews ポリシー: 誰でも閲覧可能（またはマッチング関係者のみ）
create policy "reviews_select_all" on public.reviews
  for select to authenticated
  using (true);

-- reviews ポリシー: マッチング関係者のみが作成可能
create policy "reviews_insert_related" on public.reviews
  for insert to authenticated
  with check (reviewer_id = auth.jwt() ->> 'sub');


-- インデックスの作成
create index idx_profiles_kyc on public.profiles(is_kyc_verified);
create index idx_posts_author on public.posts(author_id);
create index idx_posts_mode on public.posts(mode);
create index idx_posts_location on public.posts using gist(location_point);
create index idx_matches_post on public.matches(post_id);
create index idx_matches_user on public.matches(user_id);
create index idx_chats_match on public.chats(match_id);
create index idx_reviews_reviewee on public.reviews(reviewee_id);
