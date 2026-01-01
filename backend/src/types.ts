/**
 * Type definitions for Cloudflare Workers environment
 */

export interface Env {
  // Clerk authentication
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // D1 Database
  DB: D1Database;
}

/**
 * User context from Clerk authentication
 */
export interface AuthUser {
  userId: string;
  sessionId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
