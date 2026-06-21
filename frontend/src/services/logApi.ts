interface ApiErrorResponse {
  error?: string
  message?: string
}

export interface TodayLog {
  id: string
  habitId: string
  loggedDate: string
  note: string | null
  choiceIds: string[]
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

export async function fetchTodayLogRequest(
  token: string,
  habitId: string,
): Promise<TodayLog | null> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/logs/${habitId}/today`, {
      headers: authHeaders(token),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<TodayLog | null>(response, "Impossible de charger l'etat du jour.")
}

export async function setTodayLogRequest(
  token: string,
  habitId: string,
  choiceIds: string[] = [],
): Promise<TodayLog | null> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/logs/${habitId}/today`, {
      method: 'PUT',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ choiceIds }),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  return parseResponse<TodayLog | null>(response, "Impossible de mettre a jour l'habitude.")
}

export async function deleteTodayLogRequest(token: string, habitId: string): Promise<void> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/logs/${habitId}/today`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Verifie que le backend est demarre.")
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.message || body.error || "Impossible de decocher l'habitude.")
  }
}
