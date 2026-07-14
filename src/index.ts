import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { env } from "./lib/env.ts";

import type { AddressInfo } from "node:net";

import auth from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";

const app = new Hono();

app.use(logger());
app.use("*", cors({ origin: "*" }));

app.get("/", (c) => {
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

serve({ fetch: app.fetch, port: env.PORT }, (info: AddressInfo) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
