import { Hono } from 'hono';
import type { Env, AuthUser } from '../types';
import { requireEditAccess, canViewTree } from '../middleware/permissions';
import { clerkAuth } from '../middleware/auth';

type Variables = {
  user: AuthUser;
};

const persons = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /persons/tree/:treeId
 * Get all persons in a tree (public or with access)
 */
persons.get('/tree/:treeId', async (c) => {
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
      'SELECT * FROM persons WHERE tree_id = ? ORDER BY birth_date'
    )
      .bind(treeId)
      .all();

    return c.json({
      persons: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch persons' }, 500);
  }
});

/**
 * GET /persons/:personId
 * Get a single person by ID (public or with access)
 */
persons.get('/:personId', async (c) => {
  const personId = c.req.param('personId');

  try {
    const person = await c.env.DB.prepare(
      'SELECT * FROM persons WHERE id = ?'
    )
      .bind(personId)
      .first();

    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }

    // Check if user can view the tree this person belongs to
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

    const hasAccess = await canViewTree(c.env.DB, person.tree_id as string, userId);

    if (!hasAccess) {
      return c.json({ error: 'Person not found or tree is private' }, 404);
    }

    return c.json({ person });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch person' }, 500);
  }
});

/**
 * POST /persons
 * Create a new person (requires edit access to tree)
 */
persons.post('/', clerkAuth(), async (c) => {
  const body = await c.req.json();

  const {
    treeId,
    firstName,
    lastName,
    birthDate,
    deathDate,
    gender,
    avatarUrl,
    notes,
  } = body;

  if (!treeId || !firstName) {
    return c.json({ error: 'Tree ID and first name are required' }, 400);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, treeId, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  const personId = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO persons (
        id, tree_id, first_name, last_name, birth_date, death_date,
        gender, avatar_url, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`
    )
      .bind(
        personId,
        treeId,
        firstName,
        lastName || null,
        birthDate || null,
        deathDate || null,
        gender || null,
        avatarUrl || null,
        notes || null
      )
      .run();

    const person = await c.env.DB.prepare('SELECT * FROM persons WHERE id = ?')
      .bind(personId)
      .first();

    return c.json({ person }, 201);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to create person' }, 500);
  }
});

/**
 * PATCH /persons/:personId
 * Update a person (requires edit access to tree)
 */
persons.patch('/:personId', clerkAuth(), async (c) => {
  const personId = c.req.param('personId');
  const body = await c.req.json();

  // Get person to check tree access
  const person = await c.env.DB.prepare('SELECT tree_id FROM persons WHERE id = ?')
    .bind(personId)
    .first<{ tree_id: string }>();

  if (!person) {
    return c.json({ error: 'Person not found' }, 404);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, person.tree_id, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  const {
    firstName,
    lastName,
    birthDate,
    deathDate,
    gender,
    avatarUrl,
    notes,
  } = body;

  try {
    const updates: string[] = [];
    const bindings: any[] = [];

    if (firstName !== undefined) {
      updates.push('first_name = ?');
      bindings.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      bindings.push(lastName);
    }
    if (birthDate !== undefined) {
      updates.push('birth_date = ?');
      bindings.push(birthDate);
    }
    if (deathDate !== undefined) {
      updates.push('death_date = ?');
      bindings.push(deathDate);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      bindings.push(gender);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      bindings.push(avatarUrl);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      bindings.push(notes);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    bindings.push(personId);

    await c.env.DB.prepare(
      `UPDATE persons SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...bindings)
      .run();

    const updatedPerson = await c.env.DB.prepare('SELECT * FROM persons WHERE id = ?')
      .bind(personId)
      .first();

    return c.json({ person: updatedPerson });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to update person' }, 500);
  }
});

/**
 * DELETE /persons/:personId
 * Delete a person (requires edit access to tree)
 */
persons.delete('/:personId', clerkAuth(), async (c) => {
  const personId = c.req.param('personId');

  // Get person to check tree access
  const person = await c.env.DB.prepare('SELECT tree_id FROM persons WHERE id = ?')
    .bind(personId)
    .first<{ tree_id: string }>();

  if (!person) {
    return c.json({ error: 'Person not found' }, 404);
  }

  // Check edit access
  const user = c.get('user');
  const { canEditTree } = await import('../middleware/permissions');
  const hasAccess = await canEditTree(c.env.DB, person.tree_id, user.userId);

  if (!hasAccess) {
    return c.json({ error: 'You do not have permission to edit this tree' }, 403);
  }

  try {
    await c.env.DB.prepare('DELETE FROM persons WHERE id = ?')
      .bind(personId)
      .run();

    return c.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to delete person' }, 500);
  }
});

export default persons;
