import { db } from "../src/db/index.ts";
import type { Database } from "../src/db/index.ts";

class Rollback extends Error {}

export async function withRollback(fn: (tx: Database) => Promise<void>) {
  try {
    await db.transaction(async (tx) => {
      await fn(tx as Database);
      throw new Rollback();
    });
  } catch (err) {
    if (!(err instanceof Rollback)) throw err;
  }
}
