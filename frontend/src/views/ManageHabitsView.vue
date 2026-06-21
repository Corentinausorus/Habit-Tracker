<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useHabitsStore } from '@/stores/habits'

const router = useRouter()
const authStore = useAuthStore()
const habitsStore = useHabitsStore()

const habitName = ref('')
const hasChoices = ref(false)
const choiceNames = ref([''])
const formErrorMessage = ref('')
const newChoiceNames = ref<Record<string, string>>({})
const choiceErrorMessages = ref<Record<string, string>>({})

onMounted(() => {
  void habitsStore.fetchHabits()
})

function addChoiceField(): void {
  choiceNames.value = [...choiceNames.value, '']
}

function removeChoiceField(index: number): void {
  choiceNames.value = choiceNames.value.filter((_, choiceIndex) => choiceIndex !== index)

  if (!choiceNames.value.length) {
    choiceNames.value = ['']
  }
}

async function handleCreateHabit(): Promise<void> {
  formErrorMessage.value = ''
  const selectedChoiceNames = hasChoices.value ? choiceNames.value : []

  if (hasChoices.value && !selectedChoiceNames.some((choiceName) => choiceName.trim())) {
    formErrorMessage.value = 'Ajoute au moins un choix pour cette habitude.'
    return
  }

  try {
    await habitsStore.createHabit(habitName.value, selectedChoiceNames)
    habitName.value = ''
    hasChoices.value = false
    choiceNames.value = ['']
  } catch (error) {
    formErrorMessage.value =
      error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
  }
}

async function handleAddChoice(habitId: string): Promise<void> {
  choiceErrorMessages.value = {
    ...choiceErrorMessages.value,
    [habitId]: '',
  }

  try {
    await habitsStore.addChoice(habitId, newChoiceNames.value[habitId] || '')
    newChoiceNames.value = {
      ...newChoiceNames.value,
      [habitId]: '',
    }
  } catch (error) {
    choiceErrorMessages.value = {
      ...choiceErrorMessages.value,
      [habitId]: error instanceof Error ? error.message : 'Une erreur inconnue est survenue.',
    }
  }
}

async function handleDeactivateChoice(habitId: string, choiceId: string): Promise<void> {
  choiceErrorMessages.value = {
    ...choiceErrorMessages.value,
    [habitId]: '',
  }

  try {
    await habitsStore.deactivateChoice(habitId, choiceId)
  } catch (error) {
    choiceErrorMessages.value = {
      ...choiceErrorMessages.value,
      [habitId]: error instanceof Error ? error.message : 'Une erreur inconnue est survenue.',
    }
  }
}

async function handleActivateChoice(habitId: string, choiceId: string): Promise<void> {
  choiceErrorMessages.value = {
    ...choiceErrorMessages.value,
    [habitId]: '',
  }

  try {
    await habitsStore.activateChoice(habitId, choiceId)
  } catch (error) {
    choiceErrorMessages.value = {
      ...choiceErrorMessages.value,
      [habitId]: error instanceof Error ? error.message : 'Une erreur inconnue est survenue.',
    }
  }
}

async function handleLogout(): Promise<void> {
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
            Gestion des habitudes de {{ authStore.user?.username || authStore.user?.email }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <RouterLink
            :to="{ name: 'home' }"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Accueil
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
        <p class="text-sm font-semibold text-brand-600">Configuration</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Gerer les habitudes
        </h1>
      </div>

      <form
        class="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        @submit.prevent="handleCreateHabit"
      >
        <label for="habit-name" class="mb-2 block text-sm font-medium text-slate-700">
          Nouvelle habitude
        </label>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            id="habit-name"
            v-model="habitName"
            type="text"
            autocomplete="off"
            class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            placeholder="Ex: Sport"
            :disabled="habitsStore.isCreating"
          />
          <button
            type="submit"
            :disabled="habitsStore.isCreating"
            class="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 focus:ring-3 focus:ring-brand-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ habitsStore.isCreating ? 'Creation...' : 'Ajouter' }}
          </button>
        </div>

        <label class="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            v-model="hasChoices"
            type="checkbox"
            class="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            :disabled="habitsStore.isCreating"
          />
          Cette habitude utilise des choix
        </label>

        <div v-if="hasChoices" class="mt-4 space-y-3">
          <div
            v-for="(_, index) in choiceNames"
            :key="index"
            class="flex flex-col gap-2 sm:flex-row"
          >
            <input
              v-model="choiceNames[index]"
              type="text"
              autocomplete="off"
              class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
              :placeholder="index === 0 ? 'Ex: Tennis' : 'Autre choix'"
              :disabled="habitsStore.isCreating"
            />
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="habitsStore.isCreating || choiceNames.length === 1"
              @click="removeChoiceField(index)"
            >
              Retirer
            </button>
          </div>

          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            :disabled="habitsStore.isCreating"
            @click="addChoiceField"
          >
            Ajouter un choix
          </button>
        </div>

        <p
          v-if="formErrorMessage"
          role="alert"
          class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ formErrorMessage }}
        </p>
      </form>

      <p
        v-if="habitsStore.errorMessage && !formErrorMessage"
        role="alert"
        class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ habitsStore.errorMessage }}
      </p>

      <div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="border-b border-slate-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Habitudes configurees</h2>
        </div>

        <div v-if="habitsStore.isLoading" class="px-5 py-8 text-sm text-slate-500">
          Chargement des habitudes...
        </div>

        <div v-else-if="habitsStore.habits.length === 0" class="px-5 py-8">
          <p class="font-medium text-slate-900">Aucune habitude pour le moment</p>
          <p class="mt-1 text-sm text-slate-500">
            Ajoute ta premiere habitude pour commencer le suivi.
          </p>
        </div>

        <ul v-else class="divide-y divide-slate-200">
          <li v-for="habit in habitsStore.habits" :key="habit.id" class="px-5 py-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="truncate font-medium text-slate-900">{{ habit.name }}</p>
                <p class="text-sm text-slate-500">
                  {{ habit.hasChoices ? 'Habitude avec choix' : 'Habitude simple' }}
                </p>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Active
              </span>
            </div>

            <div v-if="habit.choices.length" class="mt-3 flex flex-wrap gap-2">
              <div
                v-for="choice in habit.choices"
                :key="choice.id"
                class="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                :class="
                  choice.isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                <span>{{ choice.name }}</span>
                <span v-if="!choice.isActive">(desactive)</span>
                <button
                  v-if="choice.isActive"
                  type="button"
                  class="font-semibold text-slate-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="habitsStore.isDeactivatingChoice"
                  @click="handleDeactivateChoice(habit.id, choice.id)"
                >
                  Desactiver
                </button>
                <button
                  v-else
                  type="button"
                  class="font-semibold text-slate-500 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="habitsStore.isActivatingChoice"
                  @click="handleActivateChoice(habit.id, choice.id)"
                >
                  Reactiver
                </button>
              </div>
            </div>

            <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="handleAddChoice(habit.id)">
              <input
                v-model="newChoiceNames[habit.id]"
                type="text"
                autocomplete="off"
                class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
                placeholder="Ajouter un choix"
                :disabled="habitsStore.isAddingChoice"
              />
              <button
                type="submit"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="habitsStore.isAddingChoice"
              >
                Ajouter
              </button>
            </form>

            <p
              v-if="choiceErrorMessages[habit.id]"
              role="alert"
              class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {{ choiceErrorMessages[habit.id] }}
            </p>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
