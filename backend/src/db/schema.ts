import { pgTable, uuid, varchar, boolean, timestamp, date, text, primaryKey, unique } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email:        varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt:    timestamp('created_at').default(sql`NOW()`),
})

export const habits = pgTable('habits', {
  id:         uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:       varchar('name', { length: 255 }).notNull(),
  hasChoices: boolean('has_choices').default(false),
  createdAt:  timestamp('created_at').default(sql`NOW()`),
})

export const choices = pgTable('choices', {
  id:      uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  name:    varchar('name', { length: 255 }).notNull(),
})

export const habitLogs = pgTable('habit_logs', {
  id:         uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  habitId:    uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  loggedDate: date('logged_date').notNull().default(sql`CURRENT_DATE`),
  note:       text('note'),
}, (table) => ({
  uniqHabitDate: unique().on(table.habitId, table.loggedDate)
}))

export const habitLogChoices = pgTable('habit_log_choices', {
  logId:    uuid('log_id').notNull().references(() => habitLogs.id, { onDelete: 'cascade' }),
  choiceId: uuid('choice_id').notNull().references(() => choices.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.logId, table.choiceId] })
}))