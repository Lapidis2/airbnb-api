import {z} from 'zod';

const createUserSchema = z.object({
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

export default createUserSchema;