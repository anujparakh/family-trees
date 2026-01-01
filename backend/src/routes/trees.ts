import { Hono } from 'hono';
import type { Env, AuthUser } from '../types';
import { requireEditAccess, requireOwnerAccess, canViewTree } from '../middleware/permissions';
import { clerkAuth } from '../middleware/auth';

type Variables = {
  user: AuthUser;
};

const trees = new Hono<{ Bindings: Env; Variables: Variables }>();

// ----------------
// Public Routes
// ----------------

/**
 * GET /trees/public
 * List all public trees
 */
trees.get('/public', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT id, name, description, root_person_id, created_at, updated_at
       FROM trees
       WHERE is_public = 1
       ORDER BY updated_at DESC
       LIMIT 100`
    ).all();

    return c.json({
      trees: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch public trees' }, 500);
  }
});

/**
 * GET /trees/:treeId
 * Get a single tree by ID (public trees or user has access)
 */
trees.get('/:treeId', async (c) => {
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
    const tree = await c.env.DB.prepare(
      'SELECT * FROM trees WHERE id = ?'
    )
      .bind(treeId)
      .first();

    if (!tree) {
      return c.json({ error: 'Tree not found' }, 404);
    }

    return c.json({ tree });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch tree' }, 500);
  }
});

/**
 * GET /trees/:treeId/complete
 * Get complete tree data (persons + families) - public or with access
 */
trees.get('/:treeId/complete', async (c) => {
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
    // Get tree metadata
    const tree = await c.env.DB.prepare('SELECT * FROM trees WHERE id = ?')
      .bind(treeId)
      .first();

    if (!tree) {
      return c.json({ error: 'Tree not found' }, 404);
    }

    // Get all persons
    const persons = await c.env.DB.prepare(
      'SELECT * FROM persons WHERE tree_id = ?'
    )
      .bind(treeId)
      .all();

    // Get all families
    const families = await c.env.DB.prepare(
      'SELECT * FROM families WHERE tree_id = ?'
    )
      .bind(treeId)
      .all();

    // Get family parents
    const familyParents = await c.env.DB.prepare(
      `SELECT fp.family_id, fp.person_id
       FROM family_parents fp
       JOIN families f ON f.id = fp.family_id
       WHERE f.tree_id = ?`
    )
      .bind(treeId)
      .all();

    // Get family children
    const familyChildren = await c.env.DB.prepare(
      `SELECT fc.family_id, fc.person_id, fc.birth_order
       FROM family_children fc
       JOIN families f ON f.id = fc.family_id
       WHERE f.tree_id = ?
       ORDER BY fc.birth_order`
    )
      .bind(treeId)
      .all();

    // Build family structure with parents and children
    const familiesWithRelations = families.results.map((family: any) => {
      const parents = familyParents.results
        .filter((fp: any) => fp.family_id === family.id)
        .map((fp: any) => fp.person_id);

      const children = familyChildren.results
        .filter((fc: any) => fc.family_id === family.id)
        .map((fc: any) => fc.person_id);

      return {
        id: family.id,
        parents,
        children,
        marriageDate: family.marriage_date,
        divorceDate: family.divorce_date,
        status: family.status,
      };
    });

    // Convert persons array to object keyed by ID
    const personsObject = persons.results.reduce((acc: any, person: any) => {
      acc[person.id] = {
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        birthDate: person.birth_date,
        deathDate: person.death_date,
        gender: person.gender,
        avatarUrl: person.avatar_url,
      };
      return acc;
    }, {});

    return c.json({
      tree: {
        id: tree.id,
        name: tree.name,
        description: tree.description,
        persons: personsObject,
        families: familiesWithRelations,
        rootPersonId: tree.root_person_id,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch tree data' }, 500);
  }
});

// ----------------
// Protected Routes
// ----------------

/**
 * GET /trees (authenticated)
 * List trees the user can edit
 */
trees.get('/', clerkAuth(), async (c) => {
  const user = c.get('user');

  try {
    const result = await c.env.DB.prepare(
      `SELECT t.*, te.role
       FROM trees t
       JOIN tree_editors te ON te.tree_id = t.id
       WHERE te.user_id = ?
       ORDER BY t.updated_at DESC`
    )
      .bind(user.userId)
      .all();

    return c.json({
      trees: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch trees' }, 500);
  }
});

/**
 * POST /trees
 * Create a new tree
 */
trees.post('/', clerkAuth(), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { name, description, isPublic = true } = body;

  if (!name) {
    return c.json({ error: 'Tree name is required' }, 400);
  }

  const treeId = crypto.randomUUID();

  try {
    // Create tree
    await c.env.DB.prepare(
      `INSERT INTO trees (id, name, description, is_public, created_at, updated_at)
       VALUES (?, ?, ?, ?, unixepoch(), unixepoch())`
    )
      .bind(treeId, name, description || null, isPublic ? 1 : 0)
      .run();

    // Grant creator ownership
    await c.env.DB.prepare(
      `INSERT INTO tree_editors (tree_id, user_id, role, created_at)
       VALUES (?, ?, 'owner', unixepoch())`
    )
      .bind(treeId, user.userId)
      .run();

    // Fetch the created tree
    const tree = await c.env.DB.prepare('SELECT * FROM trees WHERE id = ?')
      .bind(treeId)
      .first();

    return c.json({ tree }, 201);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to create tree' }, 500);
  }
});

/**
 * PATCH /trees/:treeId
 * Update a tree (requires edit access)
 */
trees.patch('/:treeId', clerkAuth(), requireEditAccess(), async (c) => {
  const treeId = c.req.param('treeId');
  const body = await c.req.json();

  const { name, description, isPublic, rootPersonId } = body;

  try {
    const updates: string[] = [];
    const bindings: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      bindings.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      bindings.push(description);
    }
    if (isPublic !== undefined) {
      updates.push('is_public = ?');
      bindings.push(isPublic ? 1 : 0);
    }
    if (rootPersonId !== undefined) {
      updates.push('root_person_id = ?');
      bindings.push(rootPersonId);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    bindings.push(treeId);

    await c.env.DB.prepare(
      `UPDATE trees SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...bindings)
      .run();

    const tree = await c.env.DB.prepare('SELECT * FROM trees WHERE id = ?')
      .bind(treeId)
      .first();

    return c.json({ tree });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to update tree' }, 500);
  }
});

/**
 * DELETE /trees/:treeId
 * Delete a tree (requires owner access)
 */
trees.delete('/:treeId', clerkAuth(), requireOwnerAccess(), async (c) => {
  const treeId = c.req.param('treeId');

  try {
    await c.env.DB.prepare('DELETE FROM trees WHERE id = ?')
      .bind(treeId)
      .run();

    return c.json({ message: 'Tree deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to delete tree' }, 500);
  }
});

export default trees;
