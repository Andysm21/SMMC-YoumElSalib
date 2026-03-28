# Pause/Resume Registrations Feature

## Overview
This feature allows admins to pause and resume registrations with custom messages. When registrations are paused, users see a custom message instead of the registration form.

## What's New

### 1. Database Table
- **Table**: `registration_status`
- **Fields**:
  - `id` (INT, PK): Always 1 (single record)
  - `is_open` (BOOLEAN): Indicates if registrations are open
  - `message` (TEXT): Custom message shown to users when paused
  - `updated_at` (TIMESTAMP): When the status was last updated

### 2. API Endpoints

#### GET `/api/admin/registration-status`
- **Accessible**: Public (no auth required)
- **Purpose**: Fetch current registration status
- **Response**:
  ```json
  {
    "id": 1,
    "is_open": true,
    "message": "",
    "updated_at": "2026-03-28T12:00:00.000Z"
  }
  ```

#### POST `/api/admin/registration-status`
- **Accessible**: Admin only (requires `x-admin-key` header)
- **Purpose**: Update registration status
- **Request**:
  ```json
  {
    "is_open": false,
    "message": "Event is at capacity. Registrations closed."
  }
  ```
- **Response**: Updated status object

### 3. Admin Dashboard
- New button in the header: **Registrations Open** (green) or **Registrations Paused** (red)
- Click the button to open a modal to:
  - Toggle registration status (Open/Paused)
  - Enter a custom message (max 500 chars)
  - Save changes

### 4. Registration Form
- Before showing the form, fetches the current registration status
- If `is_open === false`, displays the custom message instead of the form
- If `is_open === true`, displays the form normally

### 5. UI Components
- **`RegistrationStatusModal.tsx`**: Modal for admins to control registration status
  - Toggle buttons for Open/Paused
  - Textarea for custom message
  - Character counter (0-500)
  - Save and Cancel buttons
  - Feedback messages (success/error)

## Implementation Details

### Admin Workflow
1. Admin clicks the status button in the dashboard header
2. Prompted to enter the `ADMIN_SECRET_KEY` (one-time per session)
3. Modal opens with current status and message
4. Admin can toggle status and edit message
5. Click "Save Changes" to update
6. Status updates globally for all new visitors

### User Workflow
1. User visits the registration page
2. Page fetches current registration status
3. If paused: Shows custom message (e.g., "Event is full")
4. If open: Shows registration form

### Technical Implementation
- Uses Supabase `registration_status` table
- RLS policies allow public reads, admin-only updates
- Admin key validation matches other admin endpoints
- Automatic UI state management with React hooks
- Smooth animations and transitions with Framer Motion

## File Changes

### New Files
- `/app/api/admin/registration-status/route.ts` - API endpoint
- `/components/admin/RegistrationStatusModal.tsx` - Admin modal UI
- `/database_setup.sql` - SQL to create the table
- `/DATABASE_SETUP.md` - Setup instructions

### Modified Files
- `/app/admin/dashboard/page.tsx`
  - Added registration status state
  - Added fetch and update functions
  - Added status button in header
  - Added modal component
  - Added admin key state management

- `/app/page.tsx`
  - Added registration status state
  - Added useEffect to fetch status on mount
  - Added conditional rendering for paused state
  - Shows custom message when paused

## Environment Variables
No new environment variables are needed. Uses existing:
- `ADMIN_SECRET_KEY` - For admin authentication
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations

## Setup Steps

1. **Create the database table**:
   - Open your Supabase SQL Editor
   - Run the SQL from `database_setup.sql` or `DATABASE_SETUP.md`
   - Verify the table is created

2. **Test in development**:
   - Go to Admin Dashboard
   - Click the "Registrations Open" button
   - Enter your `ADMIN_SECRET_KEY` when prompted
   - Toggle the status and add a message
   - Click "Save Changes"
   - Visit the registration page to see the change

3. **Verify functionality**:
   - When paused: Registration page shows the custom message
   - When open: Registration form appears normally
   - Status persists across page refreshes

## Testing Checklist

- [ ] Database table created successfully
- [ ] Admin can click status button without errors
- [ ] Admin key prompt appears
- [ ] Modal opens with current status
- [ ] Can toggle between Open and Paused
- [ ] Can enter and edit custom message
- [ ] Changes save without errors
- [ ] User sees paused message on registration page
- [ ] User sees form when registrations are open
- [ ] Status persists after page refresh
- [ ] Build passes without errors

## Future Enhancements

- [ ] Add scheduling to auto-pause/open at specific times
- [ ] Add audit log of who paused/opened registrations and when
- [ ] Add email notification to registered users when status changes
- [ ] Add dashboard widget showing pause history
- [ ] Add analytics on registration pause impact
