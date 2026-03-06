import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { getEnvVar } from '../env'
import * as schema from './schema'

type DbClient = ReturnType<typeof drizzle>

let dbInstance: DbClient | null = null

export function getDb() {
  if (dbInstance) {
    return dbInstance
  }

  const databaseUrl = getEnvVar('DATABASE_URL')

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your environment before starting the server.',
    )
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
  })

  dbInstance = drizzle({ client: pool, schema })

  return dbInstance
}
