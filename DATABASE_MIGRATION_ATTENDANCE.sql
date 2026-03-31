-- Database Migration for Attendance Tracking
-- This SQL should be run in Supabase SQL Editor to add attendance columns to registrations table

-- Add attended and attended_at columns to registrations table if they don't exist
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMP WITH TIME ZONE;

-- Create an index on attended for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_attended ON public.registrations(attended);

-- Create an index on attended_at for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_attended_at ON public.registrations(attended_at);

-- Grant permissions for the new columns
GRANT SELECT, UPDATE ON public.registrations TO anon, authenticated;
