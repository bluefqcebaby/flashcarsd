import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAppDataSnapshot } from "#/features/flashcards/server/persistence";
import { requireAuthenticatedUserId } from "#/shared/lib/auth";

export const Route = createFileRoute("/api/app-state")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const userId = await requireAuthenticatedUserId(request);

				if (!userId) {
					return json({ error: "Unauthorized." }, { status: 401 });
				}

				return json(await getAppDataSnapshot(userId));
			},
		},
	},
});
