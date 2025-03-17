import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import items from './routes/items';

const app = new Hono();

// Mount routes
app.route('/api/items', items);

// Health check endpoint
app.get('/', (c) => c.json({ status: 'ok' }));

const port = process.env.PORT || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
}); 