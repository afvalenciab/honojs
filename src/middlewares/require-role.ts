import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { JwtVariablesEnv } from "../lib/jwt-variables-env.ts";

export const requireRole = (role: string) => {
  return createMiddleware<JwtVariablesEnv>(async (c, next) => {
    const payload = c.get("jwtPayload");

    if (payload.role !== role) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    await next();
  });
};
