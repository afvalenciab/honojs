import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

import type { AddressInfo } from "node:net";

import auth from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";

type Variables = {
  user: { id: number; role: string };
};

const app = new Hono<{ Variables: Variables }>();

app.use(logger());
app.use("*", cors({ origin: "*" }));

app.use(async (c, next) => {
  console.log("Middleware 1");
  c.set("user", { id: 123, role: "ADMIN" });

  await next();
  console.log("Middleware 2");
});

app.use(async (c, next) => {
  console.log("Middleware 3");
  await next();
  console.log("Middleware 4");
});

app.get("/", (c) => {
  const user = c.get("user");
  console.log(user);
  return c.text("Hello World!");
});

app.route("/auth", auth);
app.route("/tasks", tasks);

app.notFound((c) => c.json({ error: "Path not found" }, 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

serve({ fetch: app.fetch, port: 3000 }, (info: AddressInfo) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
