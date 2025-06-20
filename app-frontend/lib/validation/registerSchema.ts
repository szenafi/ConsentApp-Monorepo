import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().optional(),
  dateOfBirth: z.date().optional(),
  photo: z.string().nullable().optional(), // ✅ correction ici
});

export type RegisterSchema = z.infer<typeof registerSchema>;
