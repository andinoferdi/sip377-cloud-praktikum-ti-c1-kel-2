import { z } from "zod";

export const authSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters long").trim(),
});

type UpdatePasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type UpdatePasswordRouteData = {
  oldPassword: string;
  newPassword: string;
};

type ResetPasswordData = {
  newPassword: string;
  confirmNewPassword: string;
};

const updatePasswordFormSchema = z.object({
  oldPassword: authSchema.shape.password,
  newPassword: authSchema.shape.password,
  confirmNewPassword: authSchema.shape.password,
});

const updatePasswordRouteSchema = z.object({
  oldPassword: authSchema.shape.password,
  newPassword: authSchema.shape.password,
});

const resetPasswordSchema = z.object({
  newPassword: authSchema.shape.password,
  confirmNewPassword: authSchema.shape.password,
});

export const authValidation = {
  register: authSchema,
  login: authSchema.pick({ email: true, password: true }),
  update: authSchema.omit({ email: true, password: true }),
  updatePasswordForm: updatePasswordFormSchema
    .refine((data: UpdatePasswordFormData) => data.newPassword !== data.oldPassword, {
      path: ["newPassword"],
      message: "New password cannot be the same as the old password",
    })
    .refine((data: UpdatePasswordFormData) => data.newPassword === data.confirmNewPassword, {
      path: ["confirmNewPassword"],
      message: "Passwords do not match",
    }),
  updatePasswordRoute: updatePasswordRouteSchema.refine(
    (data: UpdatePasswordRouteData) => data.newPassword !== data.oldPassword,
    {
      path: ["newPassword"],
      message: "New password cannot be the same as the old password",
    }
  ),
  forgotPasswordForm: authSchema.pick({ email: true }),
  resetPassword: resetPasswordSchema.refine(
    (data: ResetPasswordData) => data.newPassword === data.confirmNewPassword,
    {
      path: ["confirmNewPassword"],
      message: "Passwords do not match",
    }
  ),
};
