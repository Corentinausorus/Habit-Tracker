import { db } from '../db/client.js'
import { habits, choices } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

export async function findAllByUserId(userId: string) {
  return db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
}

export async function findById(id: string) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(eq(habits.id, id))

  return habit ?? null
}

export async function createHabit(
  userId: string,
  name: string,
  hasChoices: boolean,
  choiceNames?: string[]
) {
  const [habit] = await db
    .insert(habits)
    .values({ userId, name, hasChoices })
    .returning()

  if (hasChoices && choiceNames?.length) {
    await db.insert(choices).values(
      choiceNames.map((name) => ({ habitId: habit.id, name }))
    )
  }

  return habit
}

export async function deleteHabit(id: string, userId: string) {
  await db
    .delete(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
}