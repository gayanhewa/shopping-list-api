import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import type { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = await verify(token, JWT_SECRET) as unknown as JWTPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }
} 