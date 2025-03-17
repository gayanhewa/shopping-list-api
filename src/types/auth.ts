export interface JWTPayload {
  userId: number;
}

declare module 'hono' {
  interface ContextVariableMap {
    'user': JWTPayload;
  }
} 