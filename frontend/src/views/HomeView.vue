<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useHabitsStore } from '@/stores/habits'
import { useTodayLogsStore } from '@/stores/todayLogs'

const router = useRouter()
const authStore = useAuthStore()
const habitsStore = useHabitsStore()
const todayLogsStore = useTodayLogsStore()
const openChoiceHabitIds = ref<Set<string>>(new Set())
const actionErrorMessage = ref('')

const isPageLoading = computed(() => habitsStore.isLoading || todayLogsStore.isLoading)

onMounted(async () => {
  await habitsStore.fetchHabits()
  await todayLogsStore.fetchTodayLogs(habitsStore.habits.map((habit) => habit.id))
})

function activeChoices(habitId: string) {
  const habit = habitsStore.habits.find((currentHabit) => currentHabit.id === habitId)
  return habit?.choices.filter((choice) => choice.isActive) ?? []
}

function isChoiceSelected(habitId: string, choiceId: string): boolean {
  return todayLogsStore.getSelectedChoiceIds(habitId).includes(choiceId)
}

function toggleChoiceList(habitId: string): void {
  const nextOpenChoiceHabitIds = new Set(openChoiceHabitIds.value)

  if (nextOpenChoiceHabitIds.has(habitId)) {
    nextOpenChoiceHabitIds.delete(habitId)
  } else {
    nextOpenChoiceHabitIds.add(habitId)
  }

  openChoiceHabitIds.value = nextOpenChoiceHabitIds
}

async function handleSimpleHabitToggle(habitId: string, checked: boolean): Promise<void> {
  actionErrorMessage.value = ''

  try {
    if (checked) {
      await todayLogsStore.markSimpleHabit(habitId)
    } else {
      await todayLogsStore.unmarkHabit(habitId)
    }
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
  }
}

async function handleChoiceToggle(
  habitId: string,
  choiceId: string,
  checked: boolean,
): Promise<void> {
  actionErrorMessage.value = ''
  const currentChoiceIds = todayLogsStore.getSelectedChoiceIds(habitId)
  const nextChoiceIds = checked
    ? Array.from(new Set([...currentChoiceIds, choiceId]))
    : currentChoiceIds.filter((currentChoiceId) => currentChoiceId !== choiceId)

  try {
    await todayLogsStore.setChoiceSelection(habitId, nextChoiceIds)
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
  }
}

async function handleLogout(): Promise<void> {
  todayLogsStore.clearTodayLogs()
  habitsStore.clearHabits()
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div class="min-w-0">
          <p class="font-bold text-brand-700">Habit Tracker</p>
          <p class="truncate text-sm text-slate-500">
            Bonjour {{ authStore.user?.username || authStore.user?.email }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <RouterLink
            :to="{ name: 'manage-habits' }"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Gerer
          </RouterLink>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            @click="handleLogout"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    </header>

    <section class="mx-auto max-w-5xl px-4 py-10">
      <div class="mb-8">
        <p class="text-sm font-semibold text-brand-600">Aujourd'hui</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Habitudes du jour
        </h1>
      </div>

      <p
        v-if="habitsStore.errorMessage || todayLogsStore.errorMessage || actionErrorMessage"
        role="alert"
        class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ actionErrorMessage || todayLogsStore.errorMessage || habitsStore.errorMessage }}
      </p>

      <div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="border-b border-slate-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-slate-900">A faire</h2>
        </div>

        <div v-if="isPageLoading" class="px-5 py-8 text-sm text-slate-500">
          Chargement des habitudes...
        </div>

        <div v-else-if="habitsStore.habits.length === 0" class="px-5 py-8">
          <p class="font-medium text-slate-900">Aucune habitude configuree</p>
          <p class="mt-1 text-sm text-slate-500">
            Va dans la gestion des habitudes pour ajouter ta premiere habitude.
          </p>
        </div>

        <ul v-else class="divide-y divide-slate-200">
          <li v-for="habit in habitsStore.habits" :key="habit.id" class="px-5 py-4">
            <div class="flex items-center gap-3">
              <input
                v-if="!habit.hasChoices"
                type="checkbox"
                class="size-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                :checked="todayLogsStore.isHabitCompleted(habit.id)"
                :disabled="todayLogsStore.isUpdating"
                @change="
                  handleSimpleHabitToggle(
                    habit.id,
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              />
              <button
                v-else
                type="button"
                class="size-5 rounded border border-slate-300 bg-white text-xs leading-none text-slate-600"
                @click="toggleChoiceList(habit.id)"
              >
                {{ openChoiceHabitIds.has(habit.id) ? '-' : '+' }}
              </button>

              <div class="min-w-0 flex-1">
                <p
                  class="truncate font-medium"
                  :class="
                    todayLogsStore.isHabitCompleted(habit.id)
                      ? 'text-brand-700'
                      : 'text-slate-900'
                  "
                >
                  {{ habit.name }}
                </p>
                <p v-if="habit.hasChoices" class="text-sm text-slate-500">
                  {{ todayLogsStore.getSelectedChoiceIds(habit.id).length }} choix selectionne(s)
                </p>
              </div>

              <span
                v-if="todayLogsStore.isHabitCompleted(habit.id)"
                class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
              >
                Fait
              </span>
            </div>

            <div
              v-if="habit.hasChoices && openChoiceHabitIds.has(habit.id)"
              class="mt-4 space-y-2 pl-8"
            >
              <p v-if="activeChoices(habit.id).length === 0" class="text-sm text-slate-500">
                Aucun choix actif pour cette habitude.
              </p>

              <label
                v-for="choice in activeChoices(habit.id)"
                :key="choice.id"
                class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  class="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  :checked="isChoiceSelected(habit.id, choice.id)"
                  :disabled="todayLogsStore.isUpdating"
                  @change="
                    handleChoiceToggle(
                      habit.id,
                      choice.id,
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <span>{{ choice.name }}</span>
              </label>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
