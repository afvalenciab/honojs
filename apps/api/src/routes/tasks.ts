import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { randomUUID } from "node:crypto";
import { validateSchema } from "../lib/validate-schemas.ts";
import type { JwtVariablesEnv } from "../lib/jwt-variables-env.ts";
import { validateJwt } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/require-role.ts";

import {
  type TaskType,
  CreateTaskSchema,
  UpdateTaskSchema,
  IdParamSchema,
} from "../schemas/task.ts";

const taskList: TaskType[] = [];

const tasks = new Hono<JwtVariablesEnv>()
  .use(validateJwt)
  .use(requireRole("ADMIN"))
  .get("/", (c) => {
    const payload = c.get("jwtPayload");

    console.log(payload);
    return c.json(taskList, 200);
  })
  .get("/:id", validateSchema("param", IdParamSchema), (c) => {
    const { id } = c.req.valid("param");
    const taskResponse = taskList.find((taskItem) => taskItem.id === id);

    if (!taskResponse) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    return c.json(taskResponse, 200);
  })
  .post("/", validateSchema("json", CreateTaskSchema), (c) => {
    const body = c.req.valid("json");

    const newTask: TaskType = {
      id: randomUUID(),
      name: body.name,
      completed: body.completed,
    };

    taskList.push(newTask);

    return c.json(newTask, 201);
  })
  .patch(
    "/:id",
    validateSchema("param", IdParamSchema),
    validateSchema("json", UpdateTaskSchema),
    (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const taskIndex = taskList.findIndex((taskItem) => taskItem.id === id);
      const currentTask = taskList[taskIndex];

      if (!currentTask) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      const updatedTask = { ...currentTask, ...body };
      taskList[taskIndex] = updatedTask;

      return c.json(updatedTask, 200);
    },
  )
  .delete("/:id", validateSchema("param", IdParamSchema), (c) => {
    const { id } = c.req.valid("param");
    const taskIndex = taskList.findIndex((item) => item.id === id);
    const currentTask = taskList[taskIndex];

    if (!currentTask) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    taskList.splice(taskIndex, 1);

    return c.body(null, 204);
  });

export default tasks;
