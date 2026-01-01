import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import type { Env, AuthUser } from '../types';

/**
 * Clerk authentication middleware for Hono
 * Verifies JWT token from Authorization header and adds user context
 */
export const clerkAuth = () => {
  return createMiddleware<{ Bindings: Env; Variables: { user: AuthUser } }>(
    async (c, next) => {
      const authHeader = c.req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - No token provided' }, 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify the Clerk session token
        const payload = await verifyToken(token, {
          secretKey: c.env.CLERK_SECRET_KEY,
        });

        // Extract user information from the payload
        const user: AuthUser = {
          userId: payload.sub,
          sessionId: payload.sid as string,
        };

        // Add user to context for use in route handlers
        c.set('user', user);

        await next();
      } catch (error) {
        console.error('Auth verification failed:', error);
        return c.json({ error: 'Unauthorized - Invalid token' }, 401);
      }
    }
  );
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * but adds user context if valid token is present
 */
export const optionalClerkAuth = () => {
  return createMiddleware<{ Bindings: Env; Variables: { user?: AuthUser } }>(
    async (c, next) => {
      const authHeader = c.req.header('Authorization');

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
          const payload = await verifyToken(token, {
            secretKey: c.env.CLERK_SECRET_KEY,
          });

          const user: AuthUser = {
            userId: payload.sub,
            sessionId: payload.sid as string,
          };

          c.set('user', user);
        } catch (error) {
          // Silently fail for optional auth
          console.warn('Optional auth failed:', error);
        }
      }

      await next();
    }
  );
};
