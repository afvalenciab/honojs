import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import type { ApplyGlobalResponse } from "hono/client";

import auth from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";

const app = new Hono()
  .use(logger())
  .use("*", cors({ origin: "*" }))
  .get("/", (c) => {
    return c.text("Hello World!");
  })
  .route("/auth", auth)
  .route("/tasks", tasks);

app.notFound((c) => c.json({ error: "Path not found" }, 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export { app };
export type AppType = ApplyGlobalResponse<
  typeof app,
  {
    401: { json: { error: string } };
    404: { json: { error: string } };
    500: { json: { error: string } };
  }
>;
