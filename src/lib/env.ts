const defaultModel = 'gpt-5-mini'

export function getEnvVar(name: 'DATABASE_URL' | 'OPENAI_API_KEY') {
  return process.env[name] ?? ''
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL ?? defaultModel
}

export function listMissingIntegrationEnvVars() {
  const required: Array<'DATABASE_URL' | 'OPENAI_API_KEY'> = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
  ]

  return required.filter((name) => getEnvVar(name).length === 0)
}
