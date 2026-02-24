import { z } from "zod";

export const createPOSInstanceSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name wajib diisi")
      .max(100, "Name maksimal 100 karakter"),
    type: z.enum(["TABLE_SERVICE", "TAB_SERVICE"], {
      message: "Type harus TABLE_SERVICE atau TAB_SERVICE",
    }),
    totalTable: z
      .number()
      .int("Total table harus bilangan bulat")
      .min(1, "Minimal 1 meja")
      .max(200, "Maksimal 200 meja")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "TABLE_SERVICE") {
        return data.totalTable !== undefined && data.totalTable >= 1;
      }
      return true;
    },
    {
      message: "Total table wajib diisi untuk Table Service",
      path: ["totalTable"],
    }
  );

export const updatePOSInstanceSchema = z.object({
  name: z
    .string()
    .min(1, "Name wajib diisi")
    .max(100, "Name maksimal 100 karakter")
    .optional(),
  totalTable: z
    .number()
    .int("Total table harus bilangan bulat")
    .min(1, "Minimal 1 meja")
    .max(200, "Maksimal 200 meja")
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateTableLabelSchema = z.object({
  label: z
    .string()
    .min(1, "Label wajib diisi")
    .max(10, "Label maksimal 10 karakter"),
});

export type CreatePOSInstanceInput = z.infer<typeof createPOSInstanceSchema>;
export type UpdatePOSInstanceInput = z.infer<typeof updatePOSInstanceSchema>;
export type UpdateTableLabelInput = z.infer<typeof updateTableLabelSchema>;
