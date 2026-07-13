import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { randomUUID } from "node:crypto";
import { z, type ZodType } from "zod";
import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

type Variables = JwtVariables<{ sub: string; role: string }>;

const TaskSchema = z.object({
  id: z.uuidv4(),
  name: z.string().min(1).max(100),
  completed: z.boolean(),
});
type TaskType = z.infer<typeof TaskSchema>;

const CreateTaskSchema = TaskSchema.omit({ id: true }).extend({
  completed: z.boolean().default(false),
});

const UpdateTaskSchema = TaskSchema.omit({ id: true })
  .partial()
  .extend({ completed: z.boolean().optional() });

const IdParamSchema = TaskSchema.pick({ id: true });

const validate = <T extends ZodType>(
  target: "json" | "param" | "query",
  schema: T,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid data",
          details: z.flattenError(result.error),
        },
        400,
      );
    }
  });
};

const taskList: TaskType[] = [];

const tasks = new Hono<{ Variables: Variables }>();
tasks.use(jwt({ secret: process.env.JWT_SECRET as string, alg: "HS256" }));

tasks.get("/", (c) => {
  const payload = c.get("jwtPayload");

  console.log(payload);
  return c.json(taskList, 200);
});

tasks.get("/:id", validate("param", IdParamSchema), (c) => {
  const { id } = c.req.valid("param");
  const taskResponse = taskList.find((taskItem) => taskItem.id === id);

  if (!taskResponse) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  return c.json(taskResponse, 200);
});

tasks.post("/", validate("json", CreateTaskSchema), (c) => {
  const body = c.req.valid("json");

  const newTask: TaskType = {
    id: randomUUID(),
    name: body.name,
    completed: body.completed,
  };

  taskList.push(newTask);

  return c.json(newTask, 201);
});

tasks.patch(
  "/:id",
  validate("param", IdParamSchema),
  validate("json", UpdateTaskSchema),
  (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const taskIndex = taskList.findIndex((taskItem) => taskItem.id === id);
    const currentTask = taskList[taskIndex];

    if (!currentTask) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    taskList[taskIndex] = { ...currentTask, ...body };

    const newTask = taskList[taskIndex];
    return c.json(newTask, 200);
  },
);

tasks.delete("/:id", validate("param", IdParamSchema), (c) => {
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
