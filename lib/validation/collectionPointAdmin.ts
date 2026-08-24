import { z } from "zod";

export const collectionPointCreateSchema = z.object({
  address: z.string().trim().min(3, "Вкажіть адресу").max(300),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  operatorName: z.string().trim().min(2, "Вкажіть оператора").max(200),
  isBulkWasteSite: z.coerce.boolean().default(false),
});

export type CollectionPointCreateInput = z.infer<
  typeof collectionPointCreateSchema
>;

export const collectionPointUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  deactivationReason: z.string().trim().max(500).optional(),
  fillLevelPercent: z.coerce.number().int().min(0).max(100).optional(),
});

export type CollectionPointUpdateInput = z.infer<
  typeof collectionPointUpdateSchema
>;
