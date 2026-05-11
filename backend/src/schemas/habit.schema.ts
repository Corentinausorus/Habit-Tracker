import { z } from 'zod'

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  hasChoices: z.boolean().default(false),
  choiceNames: z.array(z.string().min(1)).optional(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>