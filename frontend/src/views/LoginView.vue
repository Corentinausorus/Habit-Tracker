<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.login(email.value, password.value)
    await router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-4 py-12">
    <section class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70">
      <div class="mb-8">
        <p class="mb-2 text-sm font-semibold tracking-wide text-brand-600 uppercase">
          Habit Tracker
        </p>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Bon retour</h1>
        <p class="mt-2 text-sm text-slate-600">Connecte-toi pour retrouver tes habitudes.</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            placeholder="corentin@example.com"
          />
        </div>

        <div>
          <label for="password" class="mb-2 block text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            placeholder="Ton mot de passe"
          />
        </div>

        <p
          v-if="errorMessage"
          role="alert"
          class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 focus:ring-3 focus:ring-brand-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-slate-500">
        La création de compte se fait encore via Postman.
      </p>
    </section>
  </main>
</template>
