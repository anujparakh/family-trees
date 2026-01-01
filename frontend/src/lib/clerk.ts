/// <reference types="vite/types/importMeta.d.ts" />

/**
 * Clerk configuration and utilities
 */

// Get Clerk publishable key from environment
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables');
}

// API base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
