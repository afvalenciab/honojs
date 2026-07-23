import { describe, it, expect, beforeEach } from "vitest";
import { withRollback } from "../helpers";
import { createTask, listTasks } from "../../src/services/tasks";
import { db } from "../../src/db/index";
import { tasks } from "../../src/db/schema";

beforeEach(async () => {
  await db.delete(tasks);
});

describe("listTasks", () => {
  it("should return an ordered list by createdAt DESC", async () => {
    await withRollback(async (tx) => {
      await createTask(tx, { name: "primera", completed: false });
      await createTask(tx, { name: "segunda", completed: false });
      await createTask(tx, { name: "tercera", completed: false });

      const result = await listTasks(tx);
      expect(result).toHaveLength(3);

      const timestamp = result.map((t) => t.createdAt.getTime());
      const sorted = [...timestamp].sort((a, b) => a - b);
      expect(timestamp).toEqual(sorted);
    });
  });
});
