import { jwt } from "hono/jwt";
import { env } from "../lib/env.ts";

export const validateJwt = jwt({ secret: env.JWT_SECRET, alg: "HS256" });
