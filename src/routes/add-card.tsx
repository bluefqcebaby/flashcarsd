import { createFileRoute } from "@tanstack/react-router";

import { AddCardPage } from "#/features/flashcards/ui/add-card-page";
import { AppRouteGate } from "#/features/flashcards/ui/app-route-gate";

export const Route = createFileRoute("/add-card")({
	component: AddCardRoute,
});

function AddCardRoute() {
	return (
		<AppRouteGate>
			<AddCardPage />
		</AppRouteGate>
	);
}
