import { db } from '../db/client.js'
import { habits, choices } from '../db/schema.js'
import { eq, and, inArray } from 'drizzle-orm'

export async function findAllByUserId(userId: string) {
  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))

  if (!userHabits.length) {
    return []
  }

  const habitChoices = await db
    .select()
    .from(choices)
    .where(inArray(choices.habitId, userHabits.map((habit) => habit.id)))

  return userHabits.map((habit) => ({
    ...habit,
    choices: habitChoices.filter((choice) => choice.habitId === habit.id),
  }))
}

export async function findById(id: string) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(eq(habits.id, id))

  return habit ?? null
}

export async function findChoicesByHabitId(habitId: string) {
  return db
    .select()
    .from(choices)
    .where(eq(choices.habitId, habitId))
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

  let createdChoices: Array<typeof choices.$inferSelect> = []

  if (hasChoices && choiceNames?.length) {
    createdChoices = await db
      .insert(choices)
      .values(choiceNames.map((choiceName) => ({ habitId: habit.id, name: choiceName })))
      .returning()
  }

  return {
    ...habit,
    choices: createdChoices,
  }
}

export async function createChoice(habitId: string, name: string) {
  const [choice] = await db
    .insert(choices)
    .values({ habitId, name })
    .returning()

  await db
    .update(habits)
    .set({ hasChoices: true })
    .where(eq(habits.id, habitId))

  return choice
}

export async function deactivateChoice(habitId: string, choiceId: string) {
  const [choice] = await db
    .update(choices)
    .set({ isActive: false })
    .where(and(eq(choices.id, choiceId), eq(choices.habitId, habitId)))
    .returning()

  return choice ?? null
}

export async function activateChoice(habitId: string, choiceId: string) {
  const [choice] = await db
    .update(choices)
    .set({ isActive: true })
    .where(and(eq(choices.id, choiceId), eq(choices.habitId, habitId)))
    .returning()

  return choice ?? null
}

export async function deleteHabit(id: string, userId: string) {
  await db
    .delete(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
}
