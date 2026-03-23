const ADMIN_USERNAME = "andrew";
const ADMIN_PASSWORD = "andrew123";
const SESSION_KEY = "admin_session";

export const validateCredentials = (username: string, password: string): boolean => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
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
