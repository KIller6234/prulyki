import { z } from "zod";
import { complaintTypeSchema } from "./complaint";

export const complaintFormSchema = z
  .object({
    type: complaintTypeSchema,
    subject: z.string().trim().min(3, "Вкажіть тему звернення").max(200),
    description: z
      .string()
      .trim()
      .min(10, "Опишіть звернення детальніше")
      .max(4000),
    addressText: z.string().trim().max(300).optional().or(z.literal("")),
    applicantName: z.string().trim().min(3, "Вкажіть ПІБ").max(200),
    applicantPhone: z.string().trim().optional().or(z.literal("")),
    applicantEmail: z.string().trim().optional().or(z.literal("")),
    personalDataConsent: z
      .boolean()
      .refine((v) => v, "Необхідна згода на обробку персональних даних"),
  })
  .refine((v) => Boolean(v.applicantPhone) || Boolean(v.applicantEmail), {
    message: "Вкажіть телефон або електронну пошту для зв'язку",
    path: ["applicantPhone"],
  });

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

export const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  PROPOSAL: "Пропозиція / зауваження",
  PETITION: "Заява / клопотання",
  COMPLAINT: "Скарга",
};
