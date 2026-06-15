<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <main class="min-h-screen">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <p class="font-bold text-brand-700">Habit Tracker</p>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          @click="handleLogout"
        >
          Se déconnecter
        </button>
      </div>
    </header>

    <section class="mx-auto max-w-5xl px-4 py-12">
      <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm font-semibold text-brand-600">Session active</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Bonjour {{ authStore.user?.email }}
        </h1>
        <p class="mt-3 max-w-2xl text-slate-600">
          Cette page est protégée par Vue Router. La prochaine étape sera d'y afficher tes
          habitudes.
        </p>
      </div>
    </section>
  </main>
</template>
