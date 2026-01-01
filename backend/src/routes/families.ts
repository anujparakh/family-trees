import { Hono } from 'hono';
import type { Env, AuthUser } from '../types';
import { canViewTree } from '../middleware/permissions';
import { clerkAuth } from '../middleware/auth';

type Variables = {
  user: AuthUser;
};

const families = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /families/tree/:treeId
 * Get all families in a tree with parents and children
 */
families.get('/tree/:treeId', async (c) => {
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
    const familiesResult = await c.env.DB.prepare(
      'SELECT * FROM families WHERE tree_id = ?'
    )
      .bind(treeId)
      .all();

    const familyParents = await c.env.DB.prepare(
      `SELECT fp.family_id, fp.person_id
       FROM family_parents fp
       JOIN families f ON f.id = fp.family_id
       WHERE f.tree_id = ?`
    )
      .bind(treeId)
      .all();

    const familyChildren = await c.env.DB.prepare(
      `SELECT fc.family_id, fc.person_id, fc.birth_order
       FROM family_children fc
       JOIN families f ON f.id = fc.family_id
       WHERE f.tree_id = ?
       ORDER BY fc.birth_order`
    )
      .bind(treeId)
      .all();

    // Build families with relations
    const familiesWithRelations = familiesResult.results.map((family: any) => {
      const parents = familyParents.results
        .filter((fp: any) => fp.family_id === family.id)
        .map((fp: any) => fp.person_id);

      const children = familyChildren.results
        .filter((fc: any) => fc.family_id === family.id)
        .map((fc: any) => fc.person_id);

      return {
        id: family.id,
        treeId: family.tree_id,
        parents,
        children,
        marriageDate: family.marriage_date,
        divorceDate: family.divorce_date,
        status: family.status,
        notes: family.notes,
      };
    });

    return c.json({
      families: familiesWithRelations,
      count: familiesWithRelations.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch families' }, 500);
  }
});

/**
 * GET /families/:familyId
 * Get a single family by ID with parents and children
 */
families.get('/:familyId', async (c) => {
  const familyId = c.req.param('familyId');

  try {
    const family = await c.env.DB.prepare(
      'SELECT * FROM families WHERE id = ?'
    )
      .bind(familyId)
      .first();

    if (!family) {
      return c.json({ error: 'Family not found' }, 404);
    }

    // Check if user can view the tree
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

    const hasAccess = await canViewTree(c.env.DB, family.tree_id as string, userId);

    if (!hasAccess) {
      return c.json({ error: 'Family not found or tree is private' }, 404);
    }

    // Get parents
    const parents = await c.env.DB.prepare(
      'SELECT person_id FROM family_parents WHERE family_id = ?'
    )
      .bind(familyId)
      .all();

    // Get children
    const children = await c.env.DB.prepare(
      'SELECT person_id, birth_order FROM family_children WHERE family_id = ? ORDER BY birth_order'
    )
      .bind(familyId)
      .all();

    return c.json({
      family: {
        id: family.id,
        treeId: family.tree_id,
        parents: parents.results.map((p: any) => p.person_id),
        children: children.results.map((c: any) => c.person_id),
        marriageDate: family.marriage_date,
        divorceDate: family.divorce_date,
        status: family.status,
        notes: family.notes,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch family' }, 500);
  }
});

/**
 * POST /families
 * Create a new family with parents and children
 */
families.post('/', clerkAuth(), async (c) => {
  const body = await c.req.json();

  const {
    treeId,
    parents = [],
    children = [],
    marriageDate,
    divorceDate,
    status = 'unknown',
    notes,
  } = body;

  if (!treeId) {
    return c.json({ error: 'Tree ID is required' }, 400);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, treeId, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  const familyId = crypto.randomUUID();

  try {
    // Create family
    await c.env.DB.prepare(
      `INSERT INTO families (
        id, tree_id, marriage_date, divorce_date, status, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`
    )
      .bind(
        familyId,
        treeId,
        marriageDate || null,
        divorceDate || null,
        status,
        notes || null
      )
      .run();

    // Add parents
    for (const parentId of parents) {
      await c.env.DB.prepare(
        'INSERT INTO family_parents (family_id, person_id, created_at) VALUES (?, ?, unixepoch())'
      )
        .bind(familyId, parentId)
        .run();
    }

    // Add children
    for (let i = 0; i < children.length; i++) {
      await c.env.DB.prepare(
        'INSERT INTO family_children (family_id, person_id, birth_order, created_at) VALUES (?, ?, ?, unixepoch())'
      )
        .bind(familyId, children[i], i + 1)
        .run();
    }

    // Fetch created family with relations
    const family = await c.env.DB.prepare('SELECT * FROM families WHERE id = ?')
      .bind(familyId)
      .first();

    return c.json({
      family: {
        id: family.id,
        treeId: family.tree_id,
        parents,
        children,
        marriageDate: family.marriage_date,
        divorceDate: family.divorce_date,
        status: family.status,
        notes: family.notes,
      },
    }, 201);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to create family' }, 500);
  }
});

/**
 * PATCH /families/:familyId
 * Update a family (requires edit access)
 */
families.patch('/:familyId', clerkAuth(), async (c) => {
  const familyId = c.req.param('familyId');
  const body = await c.req.json();

  // Get family to check tree access
  const family = await c.env.DB.prepare('SELECT tree_id FROM families WHERE id = ?')
    .bind(familyId)
    .first<{ tree_id: string }>();

  if (!family) {
    return c.json({ error: 'Family not found' }, 404);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, family.tree_id, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  const {
    parents,
    children,
    marriageDate,
    divorceDate,
    status,
    notes,
  } = body;

  try {
    // Update family metadata
    const updates: string[] = [];
    const bindings: any[] = [];

    if (marriageDate !== undefined) {
      updates.push('marriage_date = ?');
      bindings.push(marriageDate);
    }
    if (divorceDate !== undefined) {
      updates.push('divorce_date = ?');
      bindings.push(divorceDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      bindings.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      bindings.push(notes);
    }

    if (updates.length > 0) {
      bindings.push(familyId);
      await c.env.DB.prepare(
        `UPDATE families SET ${updates.join(', ')} WHERE id = ?`
      )
        .bind(...bindings)
        .run();
    }

    // Update parents if provided
    if (parents !== undefined) {
      // Delete existing parents
      await c.env.DB.prepare('DELETE FROM family_parents WHERE family_id = ?')
        .bind(familyId)
        .run();

      // Add new parents
      for (const parentId of parents) {
        await c.env.DB.prepare(
          'INSERT INTO family_parents (family_id, person_id, created_at) VALUES (?, ?, unixepoch())'
        )
          .bind(familyId, parentId)
          .run();
      }
    }

    // Update children if provided
    if (children !== undefined) {
      // Delete existing children
      await c.env.DB.prepare('DELETE FROM family_children WHERE family_id = ?')
        .bind(familyId)
        .run();

      // Add new children
      for (let i = 0; i < children.length; i++) {
        await c.env.DB.prepare(
          'INSERT INTO family_children (family_id, person_id, birth_order, created_at) VALUES (?, ?, ?, unixepoch())'
        )
          .bind(familyId, children[i], i + 1)
          .run();
      }
    }

    // Fetch updated family
    const updatedFamily = await c.env.DB.prepare('SELECT * FROM families WHERE id = ?')
      .bind(familyId)
      .first();

    const parentsResult = await c.env.DB.prepare(
      'SELECT person_id FROM family_parents WHERE family_id = ?'
    )
      .bind(familyId)
      .all();

    const childrenResult = await c.env.DB.prepare(
      'SELECT person_id FROM family_children WHERE family_id = ? ORDER BY birth_order'
    )
      .bind(familyId)
      .all();

    return c.json({
      family: {
        id: updatedFamily.id,
        treeId: updatedFamily.tree_id,
        parents: parentsResult.results.map((p: any) => p.person_id),
        children: childrenResult.results.map((c: any) => c.person_id),
        marriageDate: updatedFamily.marriage_date,
        divorceDate: updatedFamily.divorce_date,
        status: updatedFamily.status,
        notes: updatedFamily.notes,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to update family' }, 500);
  }
});

/**
 * DELETE /families/:familyId
 * Delete a family (requires edit access)
 */
families.delete('/:familyId', clerkAuth(), async (c) => {
  const familyId = c.req.param('familyId');

  // Get family to check tree access
  const family = await c.env.DB.prepare('SELECT tree_id FROM families WHERE id = ?')
    .bind(familyId)
    .first<{ tree_id: string }>();

  if (!family) {
    return c.json({ error: 'Family not found' }, 404);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, family.tree_id, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  try {
    await c.env.DB.prepare('DELETE FROM families WHERE id = ?')
      .bind(familyId)
      .run();

    return c.json({ message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to delete family' }, 500);
  }
});

export default families;
