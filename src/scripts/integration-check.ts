import { runIntegrationCheck } from "../shared/lib/integration-check";

const report = await runIntegrationCheck();

console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
	process.exit(1);
}
