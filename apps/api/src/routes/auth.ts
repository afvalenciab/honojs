import { Hono } from "hono";
import { sign } from "hono/jwt";
import { validateSchema } from "../lib/validate-schemas.ts";
import { LoginSchema } from "../schemas/auth.ts";
import { env } from "../lib/env.ts";

const auth = new Hono().post(
  "/login",
  validateSchema("json", LoginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const payload = {
      sub: email,
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hr
    };

    const token = await sign(payload, env.JWT_SECRET, "HS256");

    return c.json({ token }, 200);
  },
);

export default auth;
