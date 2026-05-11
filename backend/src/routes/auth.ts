import { FastifyInstance } from 'fastify'
import { register, login } from '../services/authService.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

export default async function authRoutes(app: FastifyInstance) {

  app.post('/register', async (request: any, reply: any) => {
    const body = registerSchema.parse(request.body)

    const user = await register(body.email, body.password)
    const token = app.jwt.sign({ userId: user.id })

    return reply.code(201).send({ token, user })
  })

  app.post('/login', async (request: any, reply: any) => {
    const body = loginSchema.parse(request.body)

    const user = await login(body.email, body.password)
    const token = app.jwt.sign({ userId: user.id })

    return reply.send({ token, user })
  })
}