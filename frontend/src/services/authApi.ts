export interface User {
  id: string
  email: string
}

export interface LoginResponse {
  token: string
  user: User
}

interface ApiErrorResponse {
  error?: string
  message?: string
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error("Impossible de contacter l'API. Vérifie que le backend est démarré.")
  }

  const body = (await response.json().catch(() => ({}))) as LoginResponse & ApiErrorResponse

  if (!response.ok) {
    throw new Error(body.message || body.error || 'La connexion a échoué.')
  }

  return body
}
