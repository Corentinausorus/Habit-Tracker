import {
  findAllByUserId,
  findById,
  createHabit,
  deleteHabit
} from '../repositories/habitRepository.js'

export async function getUserHabits(userId: string) {
  return findAllByUserId(userId)
}

export async function createNewHabit(
  userId: string,
  name: string,
  hasChoices: boolean,
  choiceNames?: string[]
) {
  return createHabit(userId, name, hasChoices, choiceNames)
}

export async function removeHabit(id: string, userId: string) {
  const habit = await findById(id)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorisé')

  return deleteHabit(id, userId)
}