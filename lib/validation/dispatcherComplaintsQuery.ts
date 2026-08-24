import { z } from "zod";

export const dispatcherComplaintsQuerySchema = z.object({
  district: z.string().trim().max(100).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  column: z.enum(["new", "assigned", "in_progress", "resolved"]).optional(),
  q: z.string().trim().max(200).optional(),
});

export type DispatcherComplaintsQuery = z.infer<
  typeof dispatcherComplaintsQuerySchema
>;
