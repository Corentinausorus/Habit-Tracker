import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { loginRequest, type User } from '@/services/authApi'

const TOKEN_STORAGE_KEY = 'habit-tracker-token'
const USER_STORAGE_KEY = 'habit-tracker-user'

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as User
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const user = ref<User | null>(readStoredUser())
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  async function login(email: string, password: string): Promise<void> {
    const session = await loginRequest(email, password)

    token.value = session.token
    user.value = session.user
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }
})
