import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { resetFlashcardsApp } from "#/features/flashcards/server/persistence";
import { requireAuthenticatedUserId } from "#/shared/lib/auth";

export const Route = createFileRoute("/api/reset-app")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const userId = await requireAuthenticatedUserId(request);

				if (!userId) {
					return json({ error: "Unauthorized." }, { status: 401 });
				}

				return json({
					ok: true,
					settings: await resetFlashcardsApp(userId),
				});
			},
		},
	},
});
