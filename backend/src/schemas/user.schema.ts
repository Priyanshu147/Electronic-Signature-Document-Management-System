import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const resetPasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const UserValidationSchemas = {
  loginSchema,
  resetPasswordSchema,
};

export default UserValidationSchemas;