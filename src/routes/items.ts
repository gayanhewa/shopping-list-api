import { Hono } from 'hono';
import { db } from '../config/db';

const items = new Hono();

// Get all items
items.get('/', async (c) => {
  try {
    const result = await db.execute('SELECT * FROM items');
    return c.json(result.rows);
  } catch (error) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// Create a new item
items.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, quantity } = body;

    const result = await db.execute({
      sql: 'INSERT INTO items (name, quantity) VALUES (?, ?) RETURNING *',
      args: [name, quantity],
    });

    return c.json(result.rows[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

export default items; 