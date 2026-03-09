import { createFileRoute } from "@tanstack/react-router";

import { AppRouteGate } from "#/features/flashcards/ui/app-route-gate";
import { DashboardPage } from "#/features/flashcards/ui/dashboard-page";

export const Route = createFileRoute("/dashboard")({
	component: DashboardRoute,
});

function DashboardRoute() {
	return (
		<AppRouteGate>
			<DashboardPage />
		</AppRouteGate>
	);
}
