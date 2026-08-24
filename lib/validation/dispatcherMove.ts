import { z } from "zod";

export const dispatcherMoveSchema = z.object({
  column: z.enum(["new", "assigned", "in_progress", "resolved"]),
});

export type DispatcherMoveInput = z.infer<typeof dispatcherMoveSchema>;
