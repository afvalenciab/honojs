import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import tasks from "./routes/tasks.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.route("/tasks", tasks);

// const res = await app.fetch(new Request("http://localhost/"));
// console.log(await res.text());

serve({ fetch: app.fetch, port: 3000 }, (info: AddressInfo) => {
  console.log(`Sever is running on http://localhost:${info.port}`);
});
