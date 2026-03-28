-- Database Setup for Event Registration Website
-- This SQL should be run in Supabase SQL Editor

-- Create registration_status table
-- This table stores the current state of registration (open/paused) with an optional custom message
CREATE TABLE IF NOT EXISTS public.registration_status (
  id INT PRIMARY KEY DEFAULT 1,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  message TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure only one row exists
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.registration_status ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read the status
CREATE POLICY "Allow anonymous read" ON public.registration_status
  FOR SELECT USING (true);

-- Allow authenticated admins to update the status
-- Note: In production, consider adding more granular permission checks
CREATE POLICY "Allow admin updates" ON public.registration_status
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Insert the default row if it doesn't exist
INSERT INTO public.registration_status (id, is_open, message)
VALUES (1, true, '')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.registration_status TO anon, authenticated;
GRANT UPDATE ON public.registration_status TO authenticated;
