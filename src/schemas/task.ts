import { z } from "zod";

export const TaskSchema = z.object({
  id: z.uuidv4(),
  name: z.string().min(1).max(100),
  completed: z.boolean(),
});
export type TaskType = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = TaskSchema.omit({ id: true }).extend({
  completed: z.boolean().default(false),
});

export const UpdateTaskSchema = TaskSchema.omit({ id: true }).partial();

export const IdParamSchema = TaskSchema.pick({ id: true });
