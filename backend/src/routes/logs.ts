import { FastifyInstance } from 'fastify'
import { getHabitLogs, logHabit, removeLog } from '../services/logService.js'

export default async function logRoutes(app: FastifyInstance) {

  const auth = { preHandler: [app.authenticate] }

  // GET /api/logs/:habitId
  app.get('/:habitId', auth, async (request, reply) => {
    const { habitId } = request.params as { habitId: string }

    const logs = await getHabitLogs(habitId)
    return reply.send(logs)
  })

  // POST /api/logs/:habitId
  app.post('/:habitId', auth, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { habitId } = request.params as { habitId: string }
    const { note, choiceIds } = request.body as { note?: string, choiceIds?: string[] }

    try {
      const log = await logHabit(habitId, userId, note, choiceIds)
      return reply.code(201).send(log)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      return reply.code(400).send({ message })
    }
  })

  // DELETE /api/logs/:id
  app.delete('/:id', auth, async (request, reply) => {
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