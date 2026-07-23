import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { sign } from "hono/jwt";
import { app } from "../../src/app";
import { db } from "../../src/db/index";
import { tasks } from "../../src/db/schema";
import { env } from "../../src/lib/env";
import { TaskSchema } from "../../src/schemas/task";

let token: string;

beforeAll(async () => {
  token = await sign({ sub: "test-user", role: "ADMIN" }, env.JWT_SECRET);
});

beforeEach(async () => {
  await db.delete(tasks);
});

describe("PATCH /tasks/:id", () => {
  it("should reject an empty body with 400", async () => {
    const res = await app.request(
      "/tasks/00000000-0000-0000-0000-000000000000",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      },
    );

    expect(res.status).toBe(400);
  });

  it("should create a task using POST api endpoint and edit using PATCH api endpoint both successfully", async () => {
    const newTask = {
      name: "New task from test",
      completed: false,
    };

    const res = await app.request("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });

    expect(res.status).toBe(201);

    const createdTask = TaskSchema.parse(await res.json());
    expect(createdTask.name).toBe(newTask.name);
    expect(createdTask.completed).toBeFalsy();

    const resUpdate = await app.request(`/tasks/${createdTask.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: "Task completed", completed: true }),
    });

    expect(resUpdate.status).toBe(200);

    const updatedTask = TaskSchema.parse(await resUpdate.json());

    expect(updatedTask.id).toBe(createdTask.id);
    expect(updatedTask.name).toBe("Task completed");
    expect(updatedTask.completed).toBeTruthy();
  });
});
