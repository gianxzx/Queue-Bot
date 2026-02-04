import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// In Replit, the DATABASE_URL should work without extra config for Neon/Postgres.
// However, the user is experiencing authentication errors.
// This often happens if the connection string format isn't quite right for the driver
// or if SSL is required but not handled.
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
