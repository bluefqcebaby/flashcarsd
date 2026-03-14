import { createFileRoute, Navigate } from "@tanstack/react-router";

import { useFlashcardsAppSettings } from "#/features/flashcards/ui/flashcards-app-provider";
import { SignInScreen } from "#/features/flashcards/ui/sign-in-screen";

export const Route = createFileRoute("/")({
	component: IndexRoute,
});

function IndexRoute() {
	const { authStatus, bootStatus, isAuthenticated, settings } =
		useFlashcardsAppSettings();

	if (authStatus === "booting" || bootStatus === "booting") {
		return null;
	}

	if (!isAuthenticated) {
		return <SignInScreen />;
	}

	return (
		<Navigate
			to={settings.onboardingCompleted ? "/dashboard" : "/onboarding"}
			replace
		/>
	);
}
