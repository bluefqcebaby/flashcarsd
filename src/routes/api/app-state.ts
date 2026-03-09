import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { AppDataSnapshot } from "#/features/flashcards/model/types";
import {
	getAppDataSnapshot,
	importAppDataIfEmpty,
} from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/app-state")({
	server: {
		handlers: {
			GET: async () => json(await getAppDataSnapshot()),
			POST: async ({ request }) => {
				const payload = (await request.json()) as Partial<AppDataSnapshot>;
				const snapshot = await importAppDataIfEmpty({
					cards: Array.isArray(payload.cards) ? payload.cards : [],
					reviewEvents: Array.isArray(payload.reviewEvents)
						? payload.reviewEvents
						: [],
					lastSessionSummary: payload.lastSessionSummary ?? null,
				});

				return json(snapshot);
			},
		},
	},
});
