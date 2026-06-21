import { z } from 'zod'

export const createLogSchema = z.object({
  note: z.string().optional(),
  choiceIds: z.array(z.uuid()).optional(),
})

export const setTodayLogSchema = z.object({
  note: z.string().optional(),
  choiceIds: z.array(z.uuid()).default([]),
})

export type CreateLogInput = z.infer<typeof createLogSchema>
export type SetTodayLogInput = z.infer<typeof setTodayLogSchema>
