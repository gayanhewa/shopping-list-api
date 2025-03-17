import { Hono } from 'hono';
import { db } from '../config/db';
import { items } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const itemsRouter = new Hono();

// Get all items for the authenticated user
itemsRouter.get('/', async (c) => {
  try {
    const user = c.get('user');
    const result = await db.select().from(items).where(eq(items.userId, user.userId));
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// Get item by id (only if it belongs to the user)
itemsRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, user.userId)));
    
    if (!result.length) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to fetch item' }, 500);
  }
});

// Create a new item for the authenticated user
itemsRouter.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { name, quantity } = body;

    const result = await db.insert(items).values({
      name,
      quantity,
      userId: user.userId,
    }).returning();

    return c.json(result[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// Update an item (only if it belongs to the user)
itemsRouter.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const { name, quantity } = body;

    const result = await db
      .update(items)
      .set({ name, quantity })
      .where(and(eq(items.id, id), eq(items.userId, user.userId)))
      .returning();

    if (!result.length) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// Delete an item (only if it belongs to the user)
itemsRouter.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const result = await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, user.userId)))
      .returning();

    if (!result.length) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

export default itemsRouter; 