import { db } from '../db/client.js'
import { habitLogChoices, habitLogs } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'

export async function findAllByHabitId(habitId: string) {
  return db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
}

export async function findTodayLogByHabitId(habitId: string) {
  const [log] = await db
    .select()
    .from(habitLogs)
    .where(
      sql`${habitLogs.habitId} = ${habitId} and ${habitLogs.loggedDate} = CURRENT_DATE`
    )

  if (!log) {
    return null
  }

  const selectedChoices = await db
    .select()
    .from(habitLogChoices)
    .where(eq(habitLogChoices.logId, log.id))

  return {
    ...log,
    choiceIds: selectedChoices.map((choice) => choice.choiceId),
  }
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
    await replaceLogChoices(log.id, choiceIds)
  }

  return findTodayLogByHabitId(habitId)
}

export async function upsertTodayLog(habitId: string, note?: string, choiceIds: string[] = []) {
  const existingLog = await findTodayLogByHabitId(habitId)

  if (!existingLog) {
    return createLog(habitId, note, choiceIds)
  }

  if (note !== undefined) {
    await db
      .update(habitLogs)
      .set({ note })
      .where(eq(habitLogs.id, existingLog.id))
  }

  await replaceLogChoices(existingLog.id, choiceIds)

  return findTodayLogByHabitId(habitId)
}

export async function replaceLogChoices(logId: string, choiceIds: string[]) {
  await db
    .delete(habitLogChoices)
    .where(eq(habitLogChoices.logId, logId))

  if (choiceIds.length) {
    await db.insert(habitLogChoices).values(
      choiceIds.map((choiceId) => ({ logId, choiceId }))
    )
  }
}

export async function deleteLog(id: string) {
  await db
    .delete(habitLogs)
    .where(eq(habitLogs.id, id))
}
