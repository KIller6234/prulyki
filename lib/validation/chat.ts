import { z } from "zod";

export const chatMessageSchema = z.object({
  sessionToken: z.string().trim().optional(),
  message: z.string().trim().min(1, "Введіть повідомлення").max(2000),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
