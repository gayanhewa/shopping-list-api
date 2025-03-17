import { Hono } from 'hono';
import { db } from '../config/db';
import { items, lists } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const itemsRouter = new Hono();

// Get all items for a list
itemsRouter.get('/list/:listId', async (c) => {
  try {
    const user = c.get('user');
    const listId = Number(c.req.param('listId'));

    // Check if list exists and belongs to user
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, listId));

    if (!list) {
      return c.json({ error: 'List not found' }, 404);
    }

    if (list.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await db
      .select()
      .from(items)
      .where(eq(items.listId, listId));

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// Get item by id
itemsRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    // Check if list belongs to user
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, item.listId));

    if (list.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json(item);
  } catch (error) {
    return c.json({ error: 'Failed to fetch item' }, 500);
  }
});

// Create a new item in a list
itemsRouter.post('/list/:listId', async (c) => {
  try {
    const user = c.get('user');
    const listId = Number(c.req.param('listId'));
    const body = await c.req.json();
    const { name, description, quantity } = body;

    // Check if list exists and belongs to user
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, listId));

    if (!list) {
      return c.json({ error: 'List not found' }, 404);
    }

    if (list.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await db.insert(items).values({
      name,
      description,
      quantity: quantity || 1,
      listId,
    }).returning();

    return c.json(result[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// Update an item
itemsRouter.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const { name, description, quantity, isDone } = body;

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    // Check if list belongs to user
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, item.listId));

    if (list.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await db
      .update(items)
      .set({ 
        name, 
        description, 
        quantity,
        isDone,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// Delete an item
itemsRouter.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = Number(c.req.param('id'));

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    // Check if list belongs to user
    const [list] = await db
      .select()
      .from(lists)
      .where(eq(lists.id, item.listId));

    if (list.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
      .delete(items)
      .where(eq(items.id, id));

    return c.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

export default itemsRouter; 