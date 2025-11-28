-- Run this in your Supabase SQL Editor

-- 1. Create Tables
create table if not exists posts (
  id bigint primary key generated always as identity,
  title text not null,
  content text not null,
  excerpt text,
  date date default current_date,
  created_at timestamptz default now()
);

create table if not exists projects (
  id bigint primary key generated always as identity,
  title text not null,
  description text not null,
  year text,
  tags text[],
  category text,
  link text,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists galleries (
  id bigint primary key generated always as identity,
  title text not null,
  thumbnail text,
  color text default 'bg-gray-200',
  images text[],
  created_at timestamptz default now()
);

create table if not exists cv (
  id bigint primary key generated always as identity,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 2. Create Storage Bucket
insert into storage.buckets (id, name, public) 
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

-- 3. Enable RLS (Optional for Public Read, strictly needed for secure Write)
-- For simplicity in this portfolio project, we will allow public read access
alter table posts enable row level security;
create policy "Public posts are viewable by everyone" on posts for select using (true);

alter table projects enable row level security;
create policy "Public projects are viewable by everyone" on projects for select using (true);

alter table galleries enable row level security;
create policy "Public galleries are viewable by everyone" on galleries for select using (true);

alter table cv enable row level security;
create policy "Public cv is viewable by everyone" on cv for select using (true);

-- Allow Service Role (our API) to do everything
create policy "Service role has full access posts" on posts using (true) with check (true);
create policy "Service role has full access projects" on projects using (true) with check (true);
create policy "Service role has full access galleries" on galleries using (true) with check (true);
create policy "Service role has full access cv" on cv using (true) with check (true);

-- Storage Policies
create policy "Public Access" on storage.objects for select using ( bucket_id = 'portfolio-assets' );
create policy "Service Role Upload" on storage.objects for insert with check ( bucket_id = 'portfolio-assets' );

