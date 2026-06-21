import {
  activateChoice,
  findAllByUserId,
  findById,
  findChoicesByHabitId,
  createHabit,
  createChoice,
  deactivateChoice,
  deleteHabit
} from '../repositories/habitRepository.js'

function hasDuplicateChoiceNames(choiceNames: string[] | undefined): boolean {
  if (!choiceNames) {
    return false
  }

  const normalizedNames = choiceNames.map((choiceName) => choiceName.trim().toLowerCase())
  return new Set(normalizedNames).size !== normalizedNames.length
}

export async function getUserHabits(userId: string) {
  return findAllByUserId(userId)
}

export async function createNewHabit(
  userId: string,
  name: string,
  hasChoices: boolean,
  choiceNames?: string[]
) {
  if (hasDuplicateChoiceNames(choiceNames)) {
    throw new Error('Une habitude ne peut pas avoir deux choix avec le meme nom')
  }

  return createHabit(userId, name, hasChoices, choiceNames)
}

export async function addChoiceToHabit(habitId: string, userId: string, name: string) {
  const habit = await findById(habitId)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorise')

  const existingChoices = await findChoicesByHabitId(habitId)
  const normalizedName = name.trim().toLowerCase()
  const alreadyExists = existingChoices.some(
    (choice) => choice.name.trim().toLowerCase() === normalizedName
  )

  if (alreadyExists) {
    throw new Error('Ce choix existe deja pour cette habitude')
  }

  return createChoice(habitId, name)
}

export async function deactivateChoiceForHabit(
  habitId: string,
  choiceId: string,
  userId: string
) {
  const habit = await findById(habitId)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorise')

  const existingChoices = await findChoicesByHabitId(habitId)
  const choice = existingChoices.find((currentChoice) => currentChoice.id === choiceId)

  if (!choice) {
    throw new Error('Choix introuvable')
  }

  if (!choice.isActive) {
    return choice
  }

  const deactivatedChoice = await deactivateChoice(habitId, choiceId)
  if (!deactivatedChoice) throw new Error('Choix introuvable')

  return deactivatedChoice
}

export async function activateChoiceForHabit(
  habitId: string,
  choiceId: string,
  userId: string
) {
  const habit = await findById(habitId)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorise')

  const existingChoices = await findChoicesByHabitId(habitId)
  const choice = existingChoices.find((currentChoice) => currentChoice.id === choiceId)

  if (!choice) {
    throw new Error('Choix introuvable')
  }

  if (choice.isActive) {
    return choice
  }

  const activatedChoice = await activateChoice(habitId, choiceId)
  if (!activatedChoice) throw new Error('Choix introuvable')

  return activatedChoice
}

export async function removeHabit(id: string, userId: string) {
  const habit = await findById(id)
  if (!habit) throw new Error('Habitude introuvable')
  if (habit.userId !== userId) throw new Error('Non autorise')

  return deleteHabit(id, userId)
}
