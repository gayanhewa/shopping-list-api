import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '../config/db';

async function main() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error performing migrations:', error);
    process.exit(1);
  }
}

main(); 