import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  deleteTodayLogRequest,
  fetchTodayLogRequest,
  setTodayLogRequest,
  type TodayLog,
} from '@/services/logApi'
import { useAuthStore } from '@/stores/auth'

export const useTodayLogsStore = defineStore('todayLogs', () => {
  const logsByHabitId = ref<Record<string, TodayLog>>({})
  const errorMessage = ref('')
  const isLoading = ref(false)
  const isUpdating = ref(false)

  const completedHabitIds = computed(() => new Set(Object.keys(logsByHabitId.value)))

  function requireToken(): string {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Session expiree. Reconnecte-toi pour continuer.')
    }

    return authStore.token
  }

  async function fetchTodayLogs(habitIds: string[]): Promise<void> {
    errorMessage.value = ''
    isLoading.value = true

    try {
      const token = requireToken()
      const logs = await Promise.all(
        habitIds.map((habitId) => fetchTodayLogRequest(token, habitId))
      )

      logsByHabitId.value = logs.reduce<Record<string, TodayLog>>((accumulator, log) => {
        if (log) {
          accumulator[log.habitId] = log
        }

        return accumulator
      }, {})
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
    } finally {
      isLoading.value = false
    }
  }

  async function markSimpleHabit(habitId: string): Promise<void> {
    await setTodayLog(habitId, [])
  }

  async function unmarkHabit(habitId: string): Promise<void> {
    errorMessage.value = ''
    isUpdating.value = true

    try {
      await deleteTodayLogRequest(requireToken(), habitId)
      const nextLogs = { ...logsByHabitId.value }
      delete nextLogs[habitId]
      logsByHabitId.value = nextLogs
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isUpdating.value = false
    }
  }

  async function setChoiceSelection(habitId: string, choiceIds: string[]): Promise<void> {
    if (!choiceIds.length) {
      await unmarkHabit(habitId)
      return
    }

    await setTodayLog(habitId, choiceIds)
  }

  async function setTodayLog(habitId: string, choiceIds: string[]): Promise<void> {
    errorMessage.value = ''
    isUpdating.value = true

    try {
      const log = await setTodayLogRequest(requireToken(), habitId, choiceIds)
      const nextLogs = { ...logsByHabitId.value }

      if (log) {
        nextLogs[habitId] = log
      } else {
        delete nextLogs[habitId]
      }

      logsByHabitId.value = nextLogs
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      errorMessage.value = message
      throw new Error(message)
    } finally {
      isUpdating.value = false
    }
  }

  function isHabitCompleted(habitId: string): boolean {
    return completedHabitIds.value.has(habitId)
  }

  function getSelectedChoiceIds(habitId: string): string[] {
    return logsByHabitId.value[habitId]?.choiceIds ?? []
  }

  function clearTodayLogs(): void {
    logsByHabitId.value = {}
    errorMessage.value = ''
  }

  return {
    logsByHabitId,
    errorMessage,
    isLoading,
    isUpdating,
    fetchTodayLogs,
    markSimpleHabit,
    unmarkHabit,
    setChoiceSelection,
    isHabitCompleted,
    getSelectedChoiceIds,
    clearTodayLogs,
  }
})
