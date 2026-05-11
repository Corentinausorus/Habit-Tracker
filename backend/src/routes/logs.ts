import { FastifyInstance } from 'fastify'
import { getHabitLogs, logHabit, removeLog } from '../services/logService.js'
import { createLogSchema } from '../schemas/log.schema.js'

export default async function logRoutes(app: FastifyInstance) {

  const auth = { preHandler: [app.authenticate] }

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