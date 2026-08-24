import { z } from "zod";

export const dispatcherAssignSchema = z.object({
  staffId: z.string().trim().min(1, "Вкажіть інспектора"),
});

export type DispatcherAssignInput = z.infer<typeof dispatcherAssignSchema>;
