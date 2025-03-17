import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.TURSO_DATABASE_URL!.split('.')[0],
    databaseId: process.env.TURSO_DATABASE_URL!.split('.')[1],
    token: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config; 