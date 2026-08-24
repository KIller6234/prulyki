import { z } from "zod";

const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/u;
const STAFF_ROLE_VALUES = ["ADMIN", "DISPATCHER", "INSPECTOR"] as const;

export const staffCreateSchema = z.object({
  fullName: z.string().trim().min(3, "Вкажіть ПІБ").max(200),
  email: z.string().trim().email("Некоректна електронна пошта"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Некоректний номер телефону")
    .optional()
    .or(z.literal("")),
  role: z.enum(STAFF_ROLE_VALUES),
});

export type StaffCreateInput = z.infer<typeof staffCreateSchema>;

export const staffUpdateSchema = z.object({
  fullName: z.string().trim().min(3, "Вкажіть ПІБ").max(200).optional(),
  email: z.string().trim().email("Некоректна електронна пошта").optional(),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Некоректний номер телефону")
    .optional()
    .or(z.literal("")),
  role: z.enum(STAFF_ROLE_VALUES).optional(),
  isActive: z.boolean().optional(),
});

export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
