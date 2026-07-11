import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const tasks = new Hono();

type Task = { id: string; name: string };
let taskList: Task[] = [];

tasks.get("/", (c) => {
  return c.json(taskList, 200);
});

tasks.get("/:id", (c) => {
  const id = c.req.param("id");
  const taskResponse = taskList.find((taskItem) => taskItem.id === id);

  if (!taskResponse) {
    return c.text("NOT FOUND", 404);
  }

  return c.json(taskResponse, 200);
});

tasks.post("/", async (c) => {
  const body = await c.req.json();

  // Podria validar la estructura del body que en sus Objects.keys tenga la key de name

  const newTask = {
    id: randomUUID(),
    name: body.name,
  };

  taskList.push(newTask);

  return c.json(newTask, 201);
});

tasks.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  // Podria validar la estructura del body que en sus Objects.keys tenga la key de name

  const taskIndex = taskList.findIndex((taskItem) => taskItem.id === id);

  if (taskIndex === -1) {
    return c.text("NOT FOUND", 404);
  }

  const newTask = {
    id: id,
    name: body.name,
  };

  taskList[taskIndex] = newTask;

  return c.json(newTask, 200);
});

tasks.delete("/:id", (c) => {
  const id = c.req.param("id");
  const taskIndex = taskList.findIndex((item) => item.id === id);

  if (taskIndex === -1) {
    return c.text("NOT FOUND", 404);
  }

  taskList = taskList.filter((item) => item.id !== id);

  return c.body(null, 204);
});

export default tasks;
