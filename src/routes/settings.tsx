import { createFileRoute } from "@tanstack/react-router";

import { AppRouteGate } from "#/features/flashcards/ui/app-route-gate";
import { SettingsPage } from "#/features/flashcards/ui/settings-page";

export const Route = createFileRoute("/settings")({
	component: SettingsRoute,
});

function SettingsRoute() {
	return (
		<AppRouteGate>
			<SettingsPage />
		</AppRouteGate>
	);
}
