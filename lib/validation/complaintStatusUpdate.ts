import { z } from "zod";

export const complaintStatusUpdateSchema = z
  .object({
    status: z.enum([
      "REGISTERED",
      "UNDER_REVIEW",
      "FORWARDED",
      "DONE",
      "REJECTED",
      "EXTENDED",
      "ANNULLED",
    ]),
    resolutionText: z.string().trim().max(4000).optional(),
    annulReason: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.status !== "ANNULLED" || Boolean(v.annulReason), {
    message: "Вкажіть причину анулювання",
    path: ["annulReason"],
  });

export type ComplaintStatusUpdateInput = z.infer<
  typeof complaintStatusUpdateSchema
>;
