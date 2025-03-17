import { Hono } from 'hono';
import { db } from '../config/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { hash, compare } from 'bcryptjs';

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
auth.post('/register', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new HTTPException(400, { message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning();

    // Generate token
    const token = await sign({ userId: user.id }, JWT_SECRET);

    return c.json({ token });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Generate token
    const token = await sign({ userId: user.id }, JWT_SECRET);

    return c.json({ token });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    return c.json({ error: 'Failed to login' }, 500);
  }
});

export default auth; 