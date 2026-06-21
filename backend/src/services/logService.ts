import {
  createLog,
  deleteLog,
  findAllByHabitId,
  findTodayLogByHabitId,
  upsertTodayLog,
} from '../repositories/logRepository.js'
import { findById, findChoicesByHabitId } from '../repositories/habitRepository.js'

export async function getHabitLogs(habitId: string) {
  return findAllByHabitId(habitId)
}

export async function getTodayHabitLog(habitId: string, userId: string) {
  await assertHabitOwner(habitId, userId)
  return findTodayLogByHabitId(habitId)
}

export async function logHabit(
  habitId: string,
  userId: string,
  note?: string,
  choiceIds?: string[]
) {
  await assertHabitCanUseChoices(habitId, userId, choiceIds ?? [])
  return createLog(habitId, note, choiceIds)
}

export async function setTodayHabitLog(
  habitId: string,
  userId: string,
  choiceIds: string[] = [],
  note?: string
) {
  const habit = await assertHabitCanUseChoices(habitId, userId, choiceIds)

  if (habit.hasChoices && choiceIds.length === 0) {
    await removeTodayHabitLog(habitId, userId)
    return null
  }

  return upsertTodayLog(habitId, note, choiceIds)
}

export async function removeTodayHabitLog(habitId: string, userId: string) {
  await assertHabitOwner(habitId, userId)
  const log = await findTodayLogByHabitId(habitId)

  if (!log) {
    return
  }

  await deleteLog(log.id)
}

export async function removeLog(id: string) {
  return deleteLog(id)
}

async function assertHabitOwner(habitId: string, userId: string) {
  const habit = await findById(habitId)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorise')

  return habit
}

async function assertHabitCanUseChoices(
  habitId: string,
  userId: string,
  choiceIds: string[]
) {
  const habit = await assertHabitOwner(habitId, userId)

  if (!habit.hasChoices && choiceIds.length > 0) {
    throw new Error('Cette habitude ne peut pas recevoir de choix')
  }

  if (habit.hasChoices && choiceIds.length > 0) {
    const choices = await findChoicesByHabitId(habitId)
    const activeChoiceIds = new Set(
      choices.filter((choice) => choice.isActive).map((choice) => choice.id)
    )
    const allChoicesBelongToHabit = choiceIds.every((choiceId) => activeChoiceIds.has(choiceId))

    if (!allChoicesBelongToHabit) {
      throw new Error('Un choix selectionne est invalide ou desactive')
    }
  }

  return habit
}
