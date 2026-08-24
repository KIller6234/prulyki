import { z } from "zod";

export const collectionPointsQuerySchema = z.object({
  wasteCategory: z
    .enum(["MIXED", "PLASTIC", "GLASS", "PAPER", "BULK"])
    .optional(),
  onlyBulk: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  onlyProblem: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type CollectionPointsQuery = z.infer<typeof collectionPointsQuerySchema>;
