import type { JwtVariables } from "hono/jwt";

export type JwtVariablesEnv = {
  Variables: JwtVariables<{
    sub: string;
    role: string;
  }>;
};
