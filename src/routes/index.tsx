import { createFileRoute, Navigate } from "@tanstack/react-router";

import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";

export const Route = createFileRoute("/")({
	component: IndexRoute,
});

function IndexRoute() {
	const { bootStatus, state } = useFlashcardsApp();

	if (bootStatus === "booting") {
		return null;
	}

	return (
		<Navigate
			to={state.settings.onboardingCompleted ? "/dashboard" : "/onboarding"}
			replace
		/>
	);
}
