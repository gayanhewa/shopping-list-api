import { Hono } from 'hono';
import { db } from '../config/db';
import { items } from '../db/schema';
import { eq } from 'drizzle-orm';

const itemsRouter = new Hono();

// Get all items
itemsRouter.get('/', async (c) => {
  try {
    const result = await db.select().from(items);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// Get item by id
itemsRouter.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const result = await db.select().from(items).where(eq(items.id, id));
    
    if (!result.length) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to fetch item' }, 500);
  }
});

// Create a new item
itemsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, quantity } = body;

    const result = await db.insert(items).values({
      name,
      quantity,
    }).returning();

    return c.json(result[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// Update an item
itemsRouter.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const { name, quantity } = body;

    const result = await db
      .update(items)
      .set({ name, quantity })
      .where(eq(items.id, id))
      .returning();

    if (!result.length) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// Delete an item
itemsRouter.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const result = await db
      .delete(items)
      .where(eq(items.id, id))
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