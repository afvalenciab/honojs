import { z } from "zod";

const EnvSchema = z.object({
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export const env = EnvSchema.parse(process.env);
