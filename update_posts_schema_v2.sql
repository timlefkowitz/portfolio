-- Add images array column to posts table
alter table posts add column if not exists images text[];

