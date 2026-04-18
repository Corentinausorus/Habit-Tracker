import { db } from '../db/client.js'
import { habitLogs, habitLogChoices } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export async function findAllByHabitId(habitId: string) {
  return db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
}

export async function createLog(
  habitId: string,
  note?: string,
  choiceIds?: string[]
) {
  const [log] = await db
    .insert(habitLogs)
    .values({ habitId, note })
    .returning()

  if (choiceIds?.length) {
    await db.insert(habitLogChoices).values(
      choiceIds.map((choiceId) => ({ logId: log.id, choiceId }))
    )
  }

  return log
}

export async function deleteLog(id: string) {
  await db
    .delete(habitLogs)
    .where(eq(habitLogs.id, id))
}