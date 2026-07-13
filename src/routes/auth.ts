import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z, type ZodType } from "zod";
import { zValidator } from "@hono/zod-validator";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const validate = <T extends ZodType>(
  target: "json" | "param" | "query",
  schema: T,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid data",
          details: z.flattenError(result.error),
        },
        400,
      );
    }
  });
};

const auth = new Hono();

auth.post("/login", validate("json", LoginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const payload = {
    sub: email,
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hr
  };

  const token = await sign(payload, process.env.JWT_SECRET as string, "HS256");

  return c.json({ token });
});

export default auth;
