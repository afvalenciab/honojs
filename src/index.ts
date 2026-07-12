import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import tasks from "./routes/tasks.ts";

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.use(async (c, next) => {
  console.log("Middleware 1");
  await next();
  console.log("Middleware 2");
});

app.use(async (c, next) => {
  console.log("Middleware 3");
  await next();
  console.log("Middleware 4");
});

app.notFound((c) => c.json({ error: "Path not found" }, 404));

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.route("/tasks", tasks);

// const res = await app.fetch(new Request("http://localhost/"));
// console.log(await res.text());

serve({ fetch: app.fetch, port: 3000 }, (info: AddressInfo) => {
  console.log(`Sever is running on http://localhost:${info.port}`);
});
