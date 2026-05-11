import { z } from 'zod'

export const createLogSchema = z.object({
  note: z.string().optional(),
  choiceIds: z.array(z.uuid()).optional(),
})

export type CreateLogInput = z.infer<typeof createLogSchema>