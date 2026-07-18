import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validateSchema } from "../lib/validate-schemas.ts";
import type { JwtVariablesEnv } from "../lib/jwt-variables-env.ts";
import { validateJwt } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/require-role.ts";
import { db } from "../db/index.ts";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../services/tasks.ts";

import {
  CreateTaskSchema,
  UpdateTaskSchema,
  IdParamSchema,
} from "../schemas/task.ts";

const tasks = new Hono<JwtVariablesEnv>()
  .use(validateJwt)
  .use(requireRole("ADMIN"))
  .get("/", async (c) => {
    const payload = c.get("jwtPayload");
    console.log(payload);

    const tasksList = await listTasks(db);
    return c.json(tasksList, 200);
  })
  .get("/:id", validateSchema("param", IdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const task = await getTask(db, id);

    if (!task) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    return c.json(task, 200);
  })
  .post("/", validateSchema("json", CreateTaskSchema), async (c) => {
    const body = c.req.valid("json");

    const createdTask = await createTask(db, body);

    return c.json(createdTask, 201);
  })
  .patch(
    "/:id",
    validateSchema("param", IdParamSchema),
    validateSchema("json", UpdateTaskSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const updatedTask = await updateTask(db, id, body);

      if (!updatedTask) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      return c.json(updatedTask, 200);
    },
  )
  .delete("/:id", validateSchema("param", IdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const deletedTask = await deleteTask(db, id);

    if (!deletedTask) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    return c.body(null, 204);
  });

export default tasks;
