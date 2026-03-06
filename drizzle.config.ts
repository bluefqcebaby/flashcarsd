import { defineConfig } from 'drizzle-kit'

const fallbackDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
  strict: true,
  verbose: true,
})
