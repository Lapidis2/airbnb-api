import {z} from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  role: z.enum(['HOST', 'GUEST'], 'Role must be either HOST or GUEST'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits long'),
  avatar: z.url('Invalid avatar URL').optional(),
  bio: z.string().optional(),
  id: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
});

const roleEnum = z.enum(["HOST", "GUEST"] as const, {
  message: "Role must be either HOST or GUEST",
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),

  email: z.string().email("Invalid email address").optional(),

  username: z.string().min(3, "Username must be at least 3 characters").optional(),

  role: roleEnum.optional(),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only numbers")
    .optional(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),

  avatar: z.string().url("Avatar must be a valid URL").optional(),

  bio: z.string().max(200, "Bio too long").optional(),
});




