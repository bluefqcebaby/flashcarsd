import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { CompleteOnboardingInput } from "#/features/flashcards/model/types";
import { ensureStarterDeck } from "#/features/flashcards/server/persistence";
import { requireAuthenticatedUserId } from "#/shared/lib/auth";

export const Route = createFileRoute("/api/starter-deck")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const userId = await requireAuthenticatedUserId(request);

				if (!userId) {
					return json({ error: "Unauthorized." }, { status: 401 });
				}

				const payload =
					(await request.json()) as Partial<CompleteOnboardingInput>;

				if (!payload.targetLanguageId || !payload.nativeLanguageId) {
					return json(
						{ error: "targetLanguageId and nativeLanguageId are required." },
						{ status: 400 },
					);
				}

				const snapshot = await ensureStarterDeck(userId, {
					targetLanguageId: payload.targetLanguageId,
					nativeLanguageId: payload.nativeLanguageId,
					startWithStarterDeck: true,
				});

				return json(snapshot);
			},
		},
	},
});
