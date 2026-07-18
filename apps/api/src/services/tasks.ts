import { eq } from "drizzle-orm";
import type { Database } from "../db/index.ts";
import { tasks, type Task, type NewTask } from "../db/schema.ts";

export async function listTasks(db: Database): Promise<Task[]> {
  return db.select().from(tasks).orderBy(tasks.createdAt);
}

export async function getTask(
  db: Database,
  id: string,
): Promise<Task | undefined> {
  const rows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return rows[0];
}

export async function createTask(
  db: Database,
  body: Pick<NewTask, "name" | "completed">,
): Promise<Task> {
  const newRow = await db
    .insert(tasks)
    .values({
      id: crypto.randomUUID(),
      name: body.name,
      completed: body.completed,
    })
    .returning();
  return newRow[0]!;
}

export async function updateTask(
  db: Database,
  id: string,
  body: Partial<Pick<NewTask, "name" | "completed">>,
): Promise<Task | undefined> {
  const newRow = await db
    .update(tasks)
    .set(body)
    .where(eq(tasks.id, id))
    .returning();
  return newRow[0];
}

export async function deleteTask(
  db: Database,
  id: string,
): Promise<Task | undefined> {
  const deletedTask = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();
  return deletedTask[0];
}
