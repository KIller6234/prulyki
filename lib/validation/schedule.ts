import { z } from "zod";

export const scheduleSearchQuerySchema = z.object({
  street: z.string().trim().min(1, "Вкажіть назву вулиці"),
  house: z.string().trim().optional(),
});

export type ScheduleSearchQuery = z.infer<typeof scheduleSearchQuerySchema>;

export const streetAutocompleteQuerySchema = z.object({
  q: z.string().trim().min(1),
});
