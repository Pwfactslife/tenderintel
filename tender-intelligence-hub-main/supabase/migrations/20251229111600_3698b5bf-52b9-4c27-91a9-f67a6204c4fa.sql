-- Add rate limiting columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN daily_usage_count integer NOT NULL DEFAULT 0,
ADD COLUMN last_usage_date date;