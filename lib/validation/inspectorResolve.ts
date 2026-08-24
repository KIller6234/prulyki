import { z } from "zod";

export const inspectorResolveSchema = z.object({
  resolutionText: z.string().trim().max(500).optional(),
  fillLevelPercent: z.coerce.number().int().min(0).max(100),
});

export type InspectorResolveInput = z.infer<typeof inspectorResolveSchema>;
