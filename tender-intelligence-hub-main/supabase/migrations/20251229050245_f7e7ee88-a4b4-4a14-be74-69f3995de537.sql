-- Add statutory compliance boolean fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_gst boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gst_number text,
ADD COLUMN IF NOT EXISTS has_udyam boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS udyam_number text,
ADD COLUMN IF NOT EXISTS has_startup_india boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS startup_india_number text,
ADD COLUMN IF NOT EXISTS has_epf boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS epf_number text,
ADD COLUMN IF NOT EXISTS has_esic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS esic_number text,
ADD COLUMN IF NOT EXISTS has_psara boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS psara_number text,
ADD COLUMN IF NOT EXISTS has_iso boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS iso_number text,
ADD COLUMN IF NOT EXISTS has_pan boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pan_number text;