import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "NIM/NIP wajib diisi")
    .regex(/^[0-9]+$/, "NIM/NIP hanya boleh angka"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
