import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const userIdSchema = z.object({
  id: z.string().min(1),
});

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const updateUserSchema = createUserSchema.partial().extend({
  status: z.enum(["Active", "Inactive"]),
});

const resetPasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const AdminValidationSchemas = {
  loginSchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
};

export default AdminValidationSchemas;
