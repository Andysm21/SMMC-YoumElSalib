const ADMIN_CREDENTIALS = [
  { username: "andrew", password: "andrew123" },
  { username: "mora", password: "mora123" },
];
const SESSION_KEY = "admin_session";

export const validateCredentials = (username: string, password: string): boolean => {
  return ADMIN_CREDENTIALS.some(
    (admin) => admin.username === username && admin.password === password
  );
};

export const setSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, timestamp: Date.now() }));
  }
};

export const getSession = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session).loggedIn : false;
};

export const clearSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};
