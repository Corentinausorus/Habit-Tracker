import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  activateChoiceRequest,
  addChoiceRequest,
  createHabitRequest,
  deactivateChoiceRequest,
  fetchHabitsRequest,
  type Habit,
} from '@/services/habitApi'
import { useAuthStore } from '@/stores/auth'

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const errorMessage = ref('')
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isAddingChoice = ref(false)
  const isDeactivatingChoice = ref(false)
  const isActivatingChoice = ref(false)

  function hasDuplicateNames(names: string[]): boolean {
    const normalizedNames = names.map((name) => name.trim().toLowerCase()).filter(Boolean)
    return new Set(normalizedNames).size !== normalizedNames.length
  }

  function requireToken(): string {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Session expiree. Reconnecte-toi pour continuer.')
    }

    return authStore.token
  }

  async function fetchHabits(): Promise<void> {
    errorMessage.value = ''
    isLoading.value = true

    try {
      habits.value = await fetchHabitsRequest(requireToken())
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
    } finally {
      isLoading.value = false
    }
  }

  async function createHabit(name: string, choiceNames: string[] = []): Promise<void> {
    const trimmedName = name.trim()
    const trimmedChoiceNames = choiceNames
      .map((choiceName) => choiceName.trim())
      .filter(Boolean)

    if (!trimmedName) {
      throw new Error("Le nom de l'habitude est requis.")
    }

    if (hasDuplicateNames(trimmedChoiceNames)) {
      throw new Error('Une habitude ne peut pas avoir deux choix avec le meme nom.')
    }

    errorMessage.value = ''
    isCreating.value = true

    try {
      const habit = await createHabitRequest(requireToken(), trimmedName, trimmedChoiceNames)
      habits.value = [habit, ...habits.value]
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isCreating.value = false
    }
  }

  async function addChoice(habitId: string, name: string): Promise<void> {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error('Le choix est requis.')
    }

    const habit = habits.value.find((currentHabit) => currentHabit.id === habitId)
    const choiceAlreadyExists = habit?.choices.some(
      (choice) => choice.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (choiceAlreadyExists) {
      throw new Error('Ce choix existe deja pour cette habitude.')
    }

    errorMessage.value = ''
    isAddingChoice.value = true

    try {
      const choice = await addChoiceRequest(requireToken(), habitId, trimmedName)
      habits.value = habits.value.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        return {
          ...habit,
          hasChoices: true,
          choices: [...habit.choices, choice],
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isAddingChoice.value = false
    }
  }

  async function deactivateChoice(habitId: string, choiceId: string): Promise<void> {
    errorMessage.value = ''
    isDeactivatingChoice.value = true

    try {
      const updatedChoice = await deactivateChoiceRequest(requireToken(), habitId, choiceId)
      habits.value = habits.value.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        return {
          ...habit,
          choices: habit.choices.map((choice) =>
            choice.id === choiceId ? updatedChoice : choice
          ),
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isDeactivatingChoice.value = false
    }
  }

  async function activateChoice(habitId: string, choiceId: string): Promise<void> {
    errorMessage.value = ''
    isActivatingChoice.value = true

    try {
      const updatedChoice = await activateChoiceRequest(requireToken(), habitId, choiceId)
      habits.value = habits.value.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        return {
          ...habit,
          choices: habit.choices.map((choice) =>
            choice.id === choiceId ? updatedChoice : choice
          ),
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isActivatingChoice.value = false
    }
  }

  function clearHabits(): void {
    habits.value = []
    errorMessage.value = ''
  }

  return {
    habits,
    errorMessage,
    isLoading,
    isCreating,
    isAddingChoice,
    isDeactivatingChoice,
    isActivatingChoice,
    fetchHabits,
    createHabit,
    addChoice,
    deactivateChoice,
    activateChoice,
    clearHabits,
  }
})
