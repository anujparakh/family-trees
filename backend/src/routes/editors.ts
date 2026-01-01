import { Hono } from 'hono';
import type { Env, AuthUser } from '../types';
import { requireOwnerAccess, canViewTree } from '../middleware/permissions';
import { clerkAuth } from '../middleware/auth';

type Variables = {
  user: AuthUser;
};

const editors = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /editors/tree/:treeId
 * Get all editors for a tree (public for public trees, owner for private trees)
 */
editors.get('/tree/:treeId', async (c) => {
  const treeId = c.req.param('treeId');

  // Get user ID if authenticated (optional)
  const authHeader = c.req.header('Authorization');
  let userId: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = await import('@clerk/backend');
      const token = authHeader.substring(7);
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });
      userId = payload.sub;
    } catch {
      // Not authenticated, continue as anonymous
    }
  }

  // Check if user can view this tree
  const hasAccess = await canViewTree(c.env.DB, treeId, userId);

  if (!hasAccess) {
    return c.json({ error: 'Tree not found or is private' }, 404);
  }

  try {
    const result = await c.env.DB.prepare(
      `SELECT user_id, role, created_at
       FROM tree_editors
       WHERE tree_id = ?
       ORDER BY role, created_at`
    )
      .bind(treeId)
      .all();

    return c.json({
      editors: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch editors' }, 500);
  }
});

/**
 * POST /editors
 * Add a new editor to a tree (requires owner access)
 */
editors.post('/', clerkAuth(), async (c) => {
  const body = await c.req.json();

  const { treeId, userId, role = 'editor' } = body;

  if (!treeId || !userId) {
    return c.json({ error: 'Tree ID and user ID are required' }, 400);
  }

  if (!['owner', 'editor', 'viewer'].includes(role)) {
    return c.json({ error: 'Role must be owner, editor, or viewer' }, 400);
  }

  // Check owner access
  const currentUser = c.get('user');
  const { isTreeOwner } = await import('../middleware/permissions');
  const isOwner = await isTreeOwner(c.env.DB, treeId, currentUser.userId);

  if (!isOwner) {
    return c.json({ error: 'Only the tree owner can add editors' }, 403);
  }

  try {
    // Check if user already has access
    const existing = await c.env.DB.prepare(
      'SELECT role FROM tree_editors WHERE tree_id = ? AND user_id = ?'
    )
      .bind(treeId, userId)
      .first();

    if (existing) {
      return c.json({ error: 'User already has access to this tree' }, 409);
    }

    await c.env.DB.prepare(
      'INSERT INTO tree_editors (tree_id, user_id, role, created_at) VALUES (?, ?, ?, unixepoch())'
    )
      .bind(treeId, userId, role)
      .run();

    const editor = await c.env.DB.prepare(
      'SELECT user_id, role, created_at FROM tree_editors WHERE tree_id = ? AND user_id = ?'
    )
      .bind(treeId, userId)
      .first();

    return c.json({ editor }, 201);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to add editor' }, 500);
  }
});

/**
 * PATCH /editors/:treeId/:userId
 * Update an editor's role (requires owner access)
 */
editors.patch('/:treeId/:userId', clerkAuth(), requireOwnerAccess('treeId'), async (c) => {
  const treeId = c.req.param('treeId');
  const userId = c.req.param('userId');
  const body = await c.req.json();

  const { role } = body;

  if (!role) {
    return c.json({ error: 'Role is required' }, 400);
  }

  if (!['owner', 'editor', 'viewer'].includes(role)) {
    return c.json({ error: 'Role must be owner, editor, or viewer' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare(
      'SELECT role FROM tree_editors WHERE tree_id = ? AND user_id = ?'
    )
      .bind(treeId, userId)
      .first();

    if (!existing) {
      return c.json({ error: 'User does not have access to this tree' }, 404);
    }

    await c.env.DB.prepare(
      'UPDATE tree_editors SET role = ? WHERE tree_id = ? AND user_id = ?'
    )
      .bind(role, treeId, userId)
      .run();

    const editor = await c.env.DB.prepare(
      'SELECT user_id, role, created_at FROM tree_editors WHERE tree_id = ? AND user_id = ?'
    )
      .bind(treeId, userId)
      .first();

    return c.json({ editor });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to update editor' }, 500);
  }
});

/**
 * DELETE /editors/:treeId/:userId
 * Remove an editor from a tree (requires owner access)
 */
editors.delete('/:treeId/:userId', clerkAuth(), requireOwnerAccess('treeId'), async (c) => {
  const treeId = c.req.param('treeId');
  const userId = c.req.param('userId');

  const currentUser = c.get('user');

  // Prevent removing yourself if you're the only owner
  if (userId === currentUser.userId) {
    const owners = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM tree_editors
       WHERE tree_id = ? AND role = 'owner'`
    )
      .bind(treeId)
      .first<{ count: number }>();

    if (owners && owners.count <= 1) {
      return c.json({ error: 'Cannot remove yourself as the only owner' }, 400);
    }
  }

  try {
    await c.env.DB.prepare(
      'DELETE FROM tree_editors WHERE tree_id = ? AND user_id = ?'
    )
      .bind(treeId, userId)
      .run();

    return c.json({ message: 'Editor removed successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to remove editor' }, 500);
  }
});

export default editors;
