import {
  findAllByHabitId,
  createLog,
  deleteLog
} from '../repositories/logRepository.js'
import { findById } from '../repositories/habitRepository.js'

export async function getHabitLogs(habitId: string) {
  return findAllByHabitId(habitId)
}

export async function logHabit(
  habitId: string,
  userId: string,
  note?: string,
  choiceIds?: string[]
) {
  // Vérification que l'habitude appartient à l'utilisateur
  const habit = await findById(habitId)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorisé')

  return createLog(habitId, note, choiceIds)
}

export async function removeLog(id: string) {
  return deleteLog(id)
}