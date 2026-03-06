type IntegrationCheckResult = {
  ok: boolean
  durationMs: number
  details: string
  error?: string
}

export type IntegrationReport = {
  ok: boolean
  checkedAt: string
  openaiModel: string
  missingEnvVars: string[]
  checks: {
    databaseConnection: IntegrationCheckResult
    flashcardsTable: IntegrationCheckResult
    openai: IntegrationCheckResult
  }
}
