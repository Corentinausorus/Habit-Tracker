import { FastifyInstance } from 'fastify'
import {
  addChoiceToHabit,
  activateChoiceForHabit,
  createNewHabit,
  deactivateChoiceForHabit,
  getUserHabits,
  removeHabit,
} from '../services/habitService.js'
import { createChoiceSchema, createHabitSchema } from '../schemas/habit.schema.js'

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

  app.post('/:id/choices', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { id } = request.params as { id: string }
    const body = createChoiceSchema.parse(request.body)

    const choice = await addChoiceToHabit(id, userId, body.name)
    return reply.code(201).send(choice)
  })

  app.patch('/:habitId/choices/:choiceId/deactivate', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId, choiceId } = request.params as { habitId: string, choiceId: string }

    const choice = await deactivateChoiceForHabit(habitId, choiceId, userId)
    return reply.send(choice)
  })

  app.patch('/:habitId/choices/:choiceId/activate', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId, choiceId } = request.params as { habitId: string, choiceId: string }

    const choice = await activateChoiceForHabit(habitId, choiceId, userId)
    return reply.send(choice)
  })

  app.delete('/:id', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { id } = request.params as { id: string }

    await removeHabit(id, userId)
    return reply.code(204).send()
  })
}
