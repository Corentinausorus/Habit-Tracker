import { FastifyInstance } from 'fastify'
import { register, login } from '../services/authService.js'

export default async function authRoutes(app: FastifyInstance) {

  // POST /api/auth/register
  app.post('/register', async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }

    const user = await register(email, password)
    const token = app.jwt.sign({ userId: user.id })

    return reply.code(201).send({ token, user })
  })

  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }

    const user = await login(email, password)
    const token = app.jwt.sign({ userId: user.id })

    return reply.send({ token, user })
  })
}