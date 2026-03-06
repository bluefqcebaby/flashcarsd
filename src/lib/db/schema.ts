import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const flashcards = pgTable('flashcards', {
  id: uuid('id').defaultRandom().primaryKey(),
  term: text('term').notNull(),
  translation: text('translation').notNull(),
  exampleOne: text('example_one').notNull(),
  exampleTwo: text('example_two').notNull(),
  targetLanguage: text('target_language').notNull(),
  nativeLanguage: text('native_language').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
