-- Run this in your Supabase SQL Editor to add image support to posts
alter table posts add column if not exists image text;

