import { createFileRoute, Navigate } from "@tanstack/react-router";

import { useFlashcardsAppSettings } from "#/features/flashcards/ui/flashcards-app-provider";

export const Route = createFileRoute("/")({
	component: IndexRoute,
});

function IndexRoute() {
	const { bootStatus, settings } = useFlashcardsAppSettings();

	if (bootStatus === "booting") {
		return null;
	}

	return (
		<Navigate
			to={settings.onboardingCompleted ? "/dashboard" : "/onboarding"}
			replace
		/>
	);
}
