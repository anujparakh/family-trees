import { createMiddleware } from 'hono/factory';
import type { Env, AuthUser } from '../types';

/**
 * Check if user has permission to edit a tree
 */
export async function canEditTree(
  db: D1Database,
  treeId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT role FROM tree_editors
       WHERE tree_id = ? AND user_id = ? AND role IN ('owner', 'editor')`
    )
    .bind(treeId, userId)
    .first();

  return result !== null;
}

/**
 * Check if user is owner of a tree
 */
export async function isTreeOwner(
  db: D1Database,
  treeId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT role FROM tree_editors
       WHERE tree_id = ? AND user_id = ? AND role = 'owner'`
    )
    .bind(treeId, userId)
    .first();

  return result !== null;
}

/**
 * Check if tree is public
 */
export async function isTreePublic(
  db: D1Database,
  treeId: string
): Promise<boolean> {
  const result = await db
    .prepare('SELECT is_public FROM trees WHERE id = ?')
    .bind(treeId)
    .first<{ is_public: number }>();

  return result?.is_public === 1;
}

/**
 * Check if user can view a tree (public or has viewer role)
 */
export async function canViewTree(
  db: D1Database,
  treeId: string,
  userId?: string
): Promise<boolean> {
  // Check if tree is public first
  const isPublic = await isTreePublic(db, treeId);
  if (isPublic) return true;

  // If not public, check if user has any role
  if (!userId) return false;

  const result = await db
    .prepare(
      `SELECT role FROM tree_editors
       WHERE tree_id = ? AND user_id = ?`
    )
    .bind(treeId, userId)
    .first();

  return result !== null;
}

/**
 * Middleware to require edit permission on a tree
 */
export const requireEditAccess = (treeIdParam: string = 'treeId') => {
  return createMiddleware<{ Bindings: Env; Variables: { user: AuthUser } }>(
    async (c, next) => {
      const treeId = c.req.param(treeIdParam);
      const user = c.get('user');

      if (!treeId) {
        return c.json({ error: 'Tree ID is required' }, 400);
      }

      const hasAccess = await canEditTree(c.env.DB, treeId, user.userId);

      if (!hasAccess) {
        return c.json({ error: 'You do not have permission to edit this tree' }, 403);
      }

      await next();
    }
  );
};

/**
 * Middleware to require owner permission on a tree
 */
export const requireOwnerAccess = (treeIdParam: string = 'treeId') => {
  return createMiddleware<{ Bindings: Env; Variables: { user: AuthUser } }>(
    async (c, next) => {
      const treeId = c.req.param(treeIdParam);
      const user = c.get('user');

      if (!treeId) {
        return c.json({ error: 'Tree ID is required' }, 400);
      }

      const isOwner = await isTreeOwner(c.env.DB, treeId, user.userId);

      if (!isOwner) {
        return c.json({ error: 'Only the tree owner can perform this action' }, 403);
      }

      await next();
    }
  );
};
