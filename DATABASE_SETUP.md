# Database Setup Instructions

## Creating the `registration_status` Table

The pause/resume registrations feature requires a new table in your Supabase database. Follow these steps:

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `database_setup.sql`
5. Click **Run**

### Option 2: Manual SQL Execution

Copy and execute the following SQL in your Supabase SQL Editor:

```sql
-- Create registration_status table
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
CREATE POLICY "Allow admin updates" ON public.registration_status
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Insert the default row
INSERT INTO public.registration_status (id, is_open, message)
VALUES (1, true, '')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.registration_status TO anon, authenticated;
GRANT UPDATE ON public.registration_status TO authenticated;
```

## Features

### For Admins
- **Pause Registrations**: Click the status button in the admin dashboard to pause new registrations
- **Custom Message**: Set a custom message that appears to users when registrations are paused (e.g., "Event is full" or "Maintenance in progress")
- **Reopen Registrations**: Click the status button again to reopen registrations

### For Users
- When registrations are paused, users see a message on the registration form instead of the form fields
- The message can be customized by the admin

## API Endpoints

### GET `/api/admin/registration-status`
- **Access**: Public (no authentication required)
- **Response**: 
  ```json
  {
    "id": 1,
    "is_open": true,
    "message": "",
    "updated_at": "2026-03-28T12:00:00.000Z"
  }
  ```

### POST `/api/admin/registration-status`
- **Access**: Admin only (requires `x-admin-key` header)
- **Request Body**:
  ```json
  {
    "is_open": false,
    "message": "Registrations are temporarily closed for maintenance"
  }
  ```
- **Response**: Updated registration status object

## Troubleshooting

### "Table 'public.registration_status' not found"
- This means the table hasn't been created yet
- Run the SQL setup script in your Supabase SQL Editor

### "Unauthorized" Error
- Make sure you're using the correct `ADMIN_SECRET_KEY`
- The admin key must be set in your `.env.local` file
- Check that the key is being passed correctly in the request header

### RLS Policy Issues
- If you're getting "new row violates row-level security policy" errors, ensure the RLS policies are correctly set up
- The `Allow admin updates` policy should allow updates for authenticated users
