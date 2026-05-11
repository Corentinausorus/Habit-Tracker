import { FastifyInstance } from 'fastify'
import { getUserHabits, createNewHabit, removeHabit } from '../services/habitService.js'

export default async function habitRoutes(app: FastifyInstance) {

  const auth = { preHandler: [app.authenticate] }

  // GET /api/habits
  app.get('/', auth, async (request, reply) => {
    const { userId } = request.user as { userId: string }

    const habits = await getUserHabits(userId)
    return reply.send(habits)
  })

  // POST /api/habits
  app.post('/', auth, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { name, hasChoices, choiceNames } = request.body as {
      name: string
      hasChoices: boolean
      choiceNames?: string[]
    }

    const habit = await createNewHabit(userId, name, hasChoices, choiceNames)
    return reply.code(201).send(habit)
  })

  // DELETE /api/habits/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { id } = request.params as { id: string }

    await removeHabit(id, userId)
    return reply.code(204).send()
  })
}