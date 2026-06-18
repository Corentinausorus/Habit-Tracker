import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export async function findByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))

  return user ?? null
}

export async function createUser(email: string, passwordHash: string, username : string) {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, username })
    .returning({ id: users.id, email: users.email })

  return user
}