-- Add company profile columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS incorporation_date date,
ADD COLUMN IF NOT EXISTS legal_status text,
ADD COLUMN IF NOT EXISTS startup_reg_no text,
ADD COLUMN IF NOT EXISTS msme_udyam_no text,
ADD COLUMN IF NOT EXISTS turnover_2425 numeric,
ADD COLUMN IF NOT EXISTS turnover_2324 numeric,
ADD COLUMN IF NOT EXISTS turnover_2223 numeric,
ADD COLUMN IF NOT EXISTS net_worth numeric,
ADD COLUMN IF NOT EXISTS solvency_cert_value numeric,
ADD COLUMN IF NOT EXISTS work_orders jsonb DEFAULT '[]'::jsonb;

-- Add check constraint for legal_status
ALTER TABLE public.profiles
ADD CONSTRAINT valid_legal_status CHECK (
  legal_status IS NULL OR legal_status IN ('pvt-ltd', 'llp', 'proprietorship')
);