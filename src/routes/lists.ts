import { Hono } from 'hono';
import { db } from '../config/db';
import { lists } from '../db/schema';
import { eq } from 'drizzle-orm';

const listsRouter = new Hono();

// Get all lists for the authenticated user
listsRouter.get('/', async (c) => {
  try {
    const user = c.get('user');
    const result = await db.select().from(lists).where(eq(lists.userId, user.userId));
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch lists' }, 500);
  }
});

// Get list by id (only if it belongs to the user)
listsRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const result = await db
      .select()
      .from(lists)
      .where(eq(lists.id, id));
    
    if (!result.length) {
      return c.json({ error: 'List not found' }, 404);
    }

    if (result[0].userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to fetch list' }, 500);
  }
});

// Create a new list
listsRouter.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { name, description } = body;

    const result = await db.insert(lists).values({
      name,
      description,
      userId: user.userId,
    }).returning();

    return c.json(result[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create list' }, 500);
  }
});

// Update a list
listsRouter.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const { name, description } = body;

    const result = await db
      .update(lists)
      .set({ 
        name, 
        description,
        updatedAt: new Date(),
      })
      .where(eq(lists.id, id))
      .returning();

    if (!result.length) {
      return c.json({ error: 'List not found' }, 404);
    }

    if (result[0].userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to update list' }, 500);
  }
});

// Delete a list
listsRouter.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const result = await db
      .delete(lists)
      .where(eq(lists.id, id))
      .returning();

    if (!result.length) {
      return c.json({ error: 'List not found' }, 404);
    }

    if (result[0].userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ message: 'List deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete list' }, 500);
  }
});

export default listsRouter; 