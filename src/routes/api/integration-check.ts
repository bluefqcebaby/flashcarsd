import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { runIntegrationCheck } from '#/shared/lib/integration-check'

export const Route = createFileRoute('/api/integration-check')({
  server: {
    handlers: {
      GET: async () => {
        const report = await runIntegrationCheck()
        const status = report.ok ? 200 : 503
        return json(report, { status })
      },
    },
  },
})
