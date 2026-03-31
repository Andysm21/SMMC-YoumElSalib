-- Database Migration for Email Quota Tracking and Status Management
-- This SQL should be run in Supabase SQL Editor

-- ============================================
-- 1. Add new columns to registrations table
-- ============================================

ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS email_sent_count INTEGER DEFAULT 0;

-- Add check constraint for valid status values
ALTER TABLE public.registrations
ADD CONSTRAINT valid_status CHECK (status IN ('confirmed', 'waiting', 'cancelled'));

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- Create index on email_sent_count for tracking
CREATE INDEX IF NOT EXISTS idx_registrations_email_sent_count ON public.registrations(email_sent_count);

-- ============================================
-- 2. Create email_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_to TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'waiting', 'cancel', 'promotion')),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_email_logs_sent_to ON sent_to,
  INDEX idx_email_logs_type ON type,
  INDEX idx_email_logs_created_at ON created_at,
  INDEX idx_email_logs_registration_id ON registration_id
);

-- ============================================
-- 3. Set RLS policies for email_logs
-- ============================================

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view email logs
CREATE POLICY "Allow authenticated to view email logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert email logs
CREATE POLICY "Allow authenticated to insert email logs"
  ON public.email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 4. Grant permissions
-- ============================================

GRANT SELECT, INSERT ON public.email_logs TO anon, authenticated;
GRANT UPDATE ON public.registrations TO anon, authenticated;
