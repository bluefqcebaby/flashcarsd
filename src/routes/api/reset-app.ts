import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { resetAllFlashcardsData } from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/reset-app")({
	server: {
		handlers: {
			POST: async () => {
				await resetAllFlashcardsData();
				return json({ ok: true });
			},
		},
	},
});
