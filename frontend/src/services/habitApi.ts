export interface HabitChoice {
  id: string
  habitId: string
  name: string
  isActive: boolean
}

export interface Habit {
  id: string
  userId: string
  name: string
  hasChoices: boolean
  createdAt: string | null
  choices: HabitChoice[]
}

interface ApiErrorResponse {
  error?: string
  message?: string
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  }
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorResponse

  if (!response.ok) {
    throw new Error(body.message || body.error || fallbackMessage)
  }

  return body
}

export async function fetchHabitsRequest(token: string): Promise<Habit[]> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/habits`, {
      headers: authHeaders(token),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<Habit[]>(response, 'Impossible de charger les habitudes.')
}

export async function createHabitRequest(
  token: string,
  name: string,
  choiceNames: string[] = [],
): Promise<Habit> {
  let response: Response
  const hasChoices = choiceNames.length > 0

  try {
    response = await fetch(`${apiUrl}/api/habits`, {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, hasChoices, choiceNames }),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<Habit>(response, "Impossible de creer l'habitude.")
}

export async function addChoiceRequest(
  token: string,
  habitId: string,
  name: string,
): Promise<HabitChoice> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/habits/${habitId}/choices`, {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<HabitChoice>(response, "Impossible d'ajouter le choix.")
}

export async function deactivateChoiceRequest(
  token: string,
  habitId: string,
  choiceId: string,
): Promise<HabitChoice> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/habits/${habitId}/choices/${choiceId}/deactivate`, {
      method: 'PATCH',
      headers: authHeaders(token),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<HabitChoice>(response, 'Impossible de desactiver le choix.')
}

export async function activateChoiceRequest(
  token: string,
  habitId: string,
  choiceId: string,
): Promise<HabitChoice> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/habits/${habitId}/choices/${choiceId}/activate`, {
      method: 'PATCH',
      headers: authHeaders(token),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<HabitChoice>(response, 'Impossible de reactiver le choix.')
}
