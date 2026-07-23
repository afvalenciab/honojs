import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

process.loadEnvFile(".env.test");

export async function setup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();

  console.log("✅ Migrated:", process.env.DATABASE_URL);
}
