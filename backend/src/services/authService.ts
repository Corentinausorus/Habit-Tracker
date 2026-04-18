import bcrypt from 'bcrypt'
import { findByEmail, createUser } from '../repositories/userRepository.js'

export async function register(email: string, password: string) {
  const existing = await findByEmail(email)
  if (existing) throw new Error('Cet email est déjà utilisé')

  const passwordHash = await bcrypt.hash(password, 10)
  return createUser(email, passwordHash)
}

export async function login(email: string, password: string) {
  const user = await findByEmail(email)
  if (!user) throw new Error('Email ou mot de passe incorrect')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Email ou mot de passe incorrect')

  return { id: user.id, email: user.email }
}