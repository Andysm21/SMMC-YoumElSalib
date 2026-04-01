import { AdminUser, AdminSession, UserRole } from "./types";

const ADMIN_CREDENTIALS: AdminUser[] = [
  { username: "andrew", password: "andrew123", role: "admin" },
  { username: "door1", password: "door1", role: "door" },
  { username: "door2", password: "door2", role: "door" },
  { username: "door4", password: "door4", role: "door" },
  { username: "door3", password: "door3", role: "door" },
];

const SESSION_KEY = "admin_session";

export const validateCredentials = (username: string, password: string): AdminUser | null => {
  const user = ADMIN_CREDENTIALS.find(
    (admin) => admin.username === username && admin.password === password
  );
  return user || null;
};

export const setSession = (username: string, role: UserRole): void => {
  if (typeof window !== "undefined") {
    const session: AdminSession = {
      username,
      role,
      loggedIn: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};

export const getSession = (): AdminSession | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const getSessionSync = (): AdminSession | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const isLoggedIn = (): boolean => {
  const session = getSession();
  return session ? session.loggedIn : false;
};

export const getRole = (): UserRole | null => {
  const session = getSession();
  return session ? session.role : null;
};

export const getUsername = (): string | null => {
  const session = getSession();
  return session ? session.username : null;
};

export const hasRole = (requiredRole: UserRole): boolean => {
  const session = getSession();
  if (!session) return false;
  // admin has access to everything, door users can only access door routes
  if (requiredRole === "admin") {
    return session.role === "admin";
  }
  if (requiredRole === "door") {
    return session.role === "door";
  }
  return false;
};

export const clearSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};
