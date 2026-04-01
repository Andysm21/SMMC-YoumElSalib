-- Database Migration for Internal Registration (VIP/Admin users) and Soft Deletion
-- This migration adds support for admin-created users and soft deletion of registrations

-- 1. Add source column to track registration source
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'public' CHECK (source IN ('public', 'admin'));

-- 2. Add notes column for internal notes on admin-created users
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Add is_deleted column for soft deletion
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_source ON public.registrations(source);
CREATE INDEX IF NOT EXISTS idx_registrations_is_deleted ON public.registrations(is_deleted);

-- 5. Update existing policies to filter out deleted users where needed
-- Note: This is handled in the application layer queries

-- Grant permissions (if needed)
GRANT ALTER TABLE public.registrations TO authenticated;
