import type { ValidationTargets } from "hono/types";
import { z, type ZodType } from "zod";
import { zValidator } from "@hono/zod-validator";

export const validateSchema = <
  T extends ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
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
