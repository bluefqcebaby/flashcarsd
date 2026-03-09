import { createFileRoute } from "@tanstack/react-router";

import { AppRouteGate } from "#/features/flashcards/ui/app-route-gate";
import { OnboardingPage } from "#/features/flashcards/ui/onboarding-page";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingRoute,
});

function OnboardingRoute() {
	return (
		<AppRouteGate requireOnboarding={false}>
			<OnboardingPage />
		</AppRouteGate>
	);
}
