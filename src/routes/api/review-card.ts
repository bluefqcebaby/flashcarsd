import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { ReviewRating } from "#/features/flashcards/model/types";
import { reviewFlashcardById } from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/review-card")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const payload = (await request.json()) as {
					cardId?: string;
					rating?: ReviewRating;
				};

				if (
					!payload.cardId ||
					(payload.rating !== "dontKnow" &&
						payload.rating !== "ok" &&
						payload.rating !== "good" &&
						payload.rating !== "excellent")
				) {
					return json(
						{ error: "cardId and a valid rating are required." },
						{ status: 400 },
					);
				}

				const result = await reviewFlashcardById(
					payload.cardId,
					payload.rating,
				);
				if (!result) {
					return json({ error: "Card not found." }, { status: 404 });
				}

				return json(result);
			},
		},
	},
});
