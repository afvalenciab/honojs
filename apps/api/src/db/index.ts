import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env.ts";
import * as schema from "./schema.ts";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Database = NodePgDatabase<typeof schema>;
