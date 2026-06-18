import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email('Email invalide').trim().toLowerCase(),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  username: z.string().trim().min(1).max(30,'Le username doit faire moins de 30 caractères'),
})

export const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>