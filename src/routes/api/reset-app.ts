import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { resetFlashcardsApp } from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/reset-app")({
	server: {
		handlers: {
			POST: async () => {
				return json({
					ok: true,
					settings: await resetFlashcardsApp(),
				});
			},
		},
	},
});
