import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import items from './routes/items';
import auth from './routes/auth';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// Public routes
app.route('/auth', auth);

// Protected routes
app.use('/api/*', authMiddleware);
app.route('/api/items', items);

// Health check endpoint
app.get('/', (c) => c.json({ status: 'ok' }));

const port = process.env.PORT || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
}); 