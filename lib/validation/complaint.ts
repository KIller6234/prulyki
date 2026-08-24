import { z } from "zod";

export const MAX_COMPLAINT_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 МБ

export const complaintTypeSchema = z.enum([
  "PROPOSAL",
  "PETITION",
  "COMPLAINT",
]);

const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/u;

export const complaintCreateSchema = z
  .object({
    type: complaintTypeSchema,
    subject: z.string().trim().min(3, "Вкажіть тему звернення").max(200),
    description: z
      .string()
      .trim()
      .min(10, "Опишіть звернення детальніше")
      .max(4000),
    addressText: z.string().trim().max(300).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    applicantName: z.string().trim().min(3, "Вкажіть ПІБ").max(200),
    applicantPhone: z
      .string()
      .trim()
      .regex(PHONE_REGEX, "Некоректний номер телефону")
      .optional(),
    applicantEmail: z
      .string()
      .trim()
      .email("Некоректна електронна пошта")
      .optional(),
    personalDataConsent: z
      .enum(["true", "false"])
      .transform((v) => v === "true"),
  })
  .refine((v) => v.personalDataConsent, {
    message: "Необхідна згода на обробку персональних даних",
    path: ["personalDataConsent"],
  })
  .refine((v) => Boolean(v.applicantPhone) || Boolean(v.applicantEmail), {
    message: "Вкажіть телефон або електронну пошту для зв'язку",
    path: ["applicantPhone"],
  });

export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>;

export const complaintStatusQuerySchema = z.object({
  registrationNumber: z.string().trim().min(1, "Вкажіть номер звернення"),
  contact: z.string().trim().min(3, "Вкажіть телефон або e-mail"),
});
