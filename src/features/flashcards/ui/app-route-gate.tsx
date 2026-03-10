import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Surface } from "#/components/ui/surface";
import { useFlashcardsAppSettings } from "#/features/flashcards/ui/flashcards-app-provider";

function BootScreen() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4">
			<Surface className="animate-fade-in flex w-full max-w-sm flex-col items-center gap-4 px-8 py-10 text-center">
				<div className="h-14 w-14 animate-pulse-glow rounded-3xl bg-[var(--accent-gold-dim)]" />
				<p
					className="text-3xl font-extrabold text-[var(--text-primary)]"
					style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
				>
					Kana
				</p>
				<p className="text-sm text-[var(--text-secondary)]">
					Restoring your cards and review state.
				</p>
			</Surface>
		</main>
	);
}

export function AppRouteGate({
	children,
	requireOnboarding = true,
}: {
	children: ReactNode;
	requireOnboarding?: boolean;
}) {
	const { bootStatus, settings } = useFlashcardsAppSettings();

	if (bootStatus === "booting") {
		return <BootScreen />;
	}

	if (requireOnboarding && !settings.onboardingCompleted) {
		return <Navigate to="/onboarding" replace />;
	}

	if (!requireOnboarding && settings.onboardingCompleted) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
}
