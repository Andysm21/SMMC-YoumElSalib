/**
 * Application constants and configuration
 */

export const APP_NAME = "Event Platform";
export const APP_VERSION = "1.0.0";

export const SITE_CONFIG = {
  name: APP_NAME,
  description: "A production-ready event website built with Next.js, TypeScript, and Tailwind CSS",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourwebsite.com",
  author: "Your Name",
  email: "your.email@example.com",
  links: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourhandle",
    linkedin: "https://linkedin.com/in/yourprofile",
  },
};

export const NAV_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Register",
    href: "/api/register",
  },
];

export const FOOTER_LINKS = [
  {
    label: "Privacy Policy",
    href: "#",
  },
  {
    label: "Terms of Service",
    href: "#",
  },
  {
    label: "Contact",
    href: "#",
  },
];

export const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};
