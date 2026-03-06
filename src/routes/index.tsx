import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { IntegrationReport } from '#/shared/lib/integration-check'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [isChecking, setIsChecking] = useState(false)
  const [report, setReport] = useState<IntegrationReport | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)

  const runIntegrationCheck = async () => {
    setIsChecking(true)
    setRequestError(null)

    try {
      const response = await fetch('/api/integration-check')
      const payload = (await response.json()) as IntegrationReport
      setReport(payload)
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Failed to call integration endpoint.',
      )
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-6 shadow-[0_12px_32px_rgba(24,68,62,0.08)] sm:p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
          Integrations
        </h1>
        <p className="mb-4 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Check OpenAI, Postgres (Neon), and Drizzle integration status.
        </p>
        <button
          type="button"
          onClick={runIntegrationCheck}
          disabled={isChecking}
          className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? 'Checking...' : 'Run integration check'}
        </button>

        {requestError ? <p className="mt-4 text-sm text-red-700">{requestError}</p> : null}

        {report ? (
          <pre className="mt-4 overflow-x-auto rounded-xl border border-[rgba(23,58,64,0.16)] bg-[rgba(255,255,255,0.64)] p-4 text-xs leading-relaxed text-[var(--sea-ink)]">
            {JSON.stringify(report, null, 2)}
          </pre>
        ) : null}
      </section>
    </main>
  )
}
