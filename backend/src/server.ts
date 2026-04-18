import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

const app = Fastify({ logger: true })

// --- Plugins ---
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
})

// --- Décorateur d'authentification ---
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

// --- Routes ---
const { default: authRoutes }  = await import('./routes/auth.js')
const { default: habitRoutes } = await import('./routes/habits.js')
const { default: logRoutes }   = await import('./routes/logs.js')

app.register(authRoutes,  { prefix: '/api/auth' })
app.register(habitRoutes, { prefix: '/api/habits' })
app.register(logRoutes,   { prefix: '/api/logs' })

// --- Démarrage ---
try {
  await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}