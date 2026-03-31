/**
 * TypeScript type definitions for the application
 */

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationData = {
  name: string;
  email: string;
};

export type RegistrationResponse = {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    registeredAt: string;
  };
  error?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type SiteMetadata = {
  title: string;
  description: string;
  url: string;
  author: string;
  email: string;
};

// Auth and Session Types
export type UserRole = "admin" | "door";

export type AdminSession = {
  username: string;
  role: UserRole;
  loggedIn: boolean;
  timestamp: number;
};

export type AdminUser = {
  username: string;
  password: string;
  role: UserRole;
};

// Registration with attendance
export type RegistrationWithAttendance = Registration & {
  attended: boolean;
  attended_at: string | null;
};

export type RegistrationStatus = "confirmed" | "waiting" | "cancelled";

export type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  church_name: string;
  confirmation_code: string;
  is_confirmed: boolean;
  email_sent: boolean;
  created_at: string;
  attended?: boolean;
  attended_at?: string | null;
  role?: string;
  waiting_list_turn?: number | null;
  status?: RegistrationStatus; // "confirmed", "waiting", "cancelled"
  email_sent_count?: number; // tracks emails sent to this user
};

export type EmailLog = {
  id: string;
  sent_to: string; // email address
  type: "confirmation" | "waiting" | "cancel" | "promotion"; // email type
  created_at: string;
  registration_id?: string;
};

export type EmailStats = {
  sentToday: number;
  estimatedLimit: number;
  remaining: number;
  resetMessage: string;
};
