import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import { app } from "./app.ts";
import { env } from "./lib/env.ts";

serve({ fetch: app.fetch, port: env.PORT }, (info: AddressInfo) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
