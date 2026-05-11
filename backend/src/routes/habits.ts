import { FastifyInstance } from 'fastify'
import { getUserHabits, createNewHabit, removeHabit } from '../services/habitService.js'
import { createHabitSchema } from '../schemas/habit.schema.js'

export default async function habitRoutes(app: FastifyInstance) {

  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }

    const habits = await getUserHabits(userId)
    return reply.send(habits)
  })

  app.post('/', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const body = createHabitSchema.parse(request.body)

    const habit = await createNewHabit(userId, body.name, body.hasChoices, body.choiceNames)
    return reply.code(201).send(habit)
  })

  app.delete('/:id', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { id } = request.params as { id: string }

    await removeHabit(id, userId)
    return reply.code(204).send()
  })
}