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
