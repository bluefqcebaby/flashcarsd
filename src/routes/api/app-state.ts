import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAppDataSnapshot } from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/app-state")({
	server: {
		handlers: {
			GET: async () => json(await getAppDataSnapshot()),
		},
	},
});
