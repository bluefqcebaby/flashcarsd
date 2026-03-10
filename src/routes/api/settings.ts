import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import type { AppSettings } from "#/features/flashcards/model/types";
import {
	getAppSettings,
	updateAppSettings,
} from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/settings")({
	server: {
		handlers: {
			GET: async () => json(await getAppSettings()),
			PATCH: async ({ request }) => {
				const payload = (await request.json()) as Partial<AppSettings>;

				if (
					("onboardingCompleted" in payload &&
						typeof payload.onboardingCompleted !== "boolean") ||
					("activeLanguageId" in payload &&
						payload.activeLanguageId !== null &&
						typeof payload.activeLanguageId !== "string") ||
					("nativeLanguageId" in payload &&
						typeof payload.nativeLanguageId !== "string")
				) {
					return json({ error: "Invalid settings payload." }, { status: 400 });
				}

				const settings = await updateAppSettings(payload);
				return json(settings);
			},
		},
	},
});
