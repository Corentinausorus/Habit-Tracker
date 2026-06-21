import { z } from 'zod'

const habitNameSchema = z.string().trim().min(1, 'Le nom est requis').max(255)
const choiceNameSchema = z.string().trim().min(1, 'Le choix est requis').max(255)

function hasUniqueChoiceNames(choiceNames: string[] | undefined): boolean {
  if (!choiceNames) {
    return true
  }

  const normalizedNames = choiceNames.map((choiceName) => choiceName.trim().toLowerCase())
  return new Set(normalizedNames).size === normalizedNames.length
}

export const createHabitSchema = z.object({
  name: habitNameSchema,
  hasChoices: z.boolean().default(false),
  choiceNames: z.array(choiceNameSchema).optional(),
})
  .refine(
    (habit) => !habit.hasChoices || Boolean(habit.choiceNames?.length),
    {
      message: 'Une habitude avec choix doit avoir au moins un choix',
      path: ['choiceNames'],
    },
  )
  .refine(
    (habit) => hasUniqueChoiceNames(habit.choiceNames),
    {
      message: 'Une habitude ne peut pas avoir deux choix avec le meme nom',
      path: ['choiceNames'],
    },
  )

export const createChoiceSchema = z.object({
  name: choiceNameSchema,
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type CreateChoiceInput = z.infer<typeof createChoiceSchema>
