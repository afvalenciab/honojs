import { z, type ZodType } from "zod";
import { zValidator } from "@hono/zod-validator";

export const validateSchema = <T extends ZodType>(
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
