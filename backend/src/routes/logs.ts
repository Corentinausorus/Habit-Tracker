import { FastifyInstance } from 'fastify'
import {
  getHabitLogs,
  getTodayHabitLog,
  logHabit,
  removeLog,
  removeTodayHabitLog,
  setTodayHabitLog,
} from '../services/logService.js'
import { createLogSchema, setTodayLogSchema } from '../schemas/log.schema.js'

export default async function logRoutes(app: FastifyInstance) {

  const auth = { preHandler: [app.authenticate] }

  app.get('/:habitId/today', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId } = request.params as { habitId: string }

    const log = await getTodayHabitLog(habitId, userId)
    return reply.send(log)
  })

  app.put('/:habitId/today', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId } = request.params as { habitId: string }
    const body = setTodayLogSchema.parse(request.body)

    try {
      const log = await setTodayHabitLog(habitId, userId, body.choiceIds, body.note)
      return reply.send(log)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      return reply.code(400).send({ message })
    }
  })

  app.delete('/:habitId/today', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId } = request.params as { habitId: string }

    try {
      await removeTodayHabitLog(habitId, userId)
      return reply.code(204).send()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      return reply.code(400).send({ message })
    }
  })

  app.get('/:habitId', auth, async (request: any, reply: any) => {
    const { habitId } = request.params as { habitId: string }

    const logs = await getHabitLogs(habitId)
    return reply.send(logs)
  })

  app.post('/:habitId', auth, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { habitId } = request.params as { habitId: string }
    const body = createLogSchema.parse(request.body)

    try {
      const log = await logHabit(habitId, userId, body.note, body.choiceIds)
      return reply.code(201).send(log)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      return reply.code(400).send({ message })
    }
  })

  app.delete('/:id', auth, async (request: any, reply: any) => {
    const { id } = request.params as { id: string }

    try {
      await removeLog(id)
      return reply.code(204).send()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      return reply.code(400).send({ message })
    }
  })
}
