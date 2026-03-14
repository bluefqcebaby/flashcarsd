import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { ReviewSessionSummary } from "#/features/flashcards/model/types";
import { saveReviewSessionSummary } from "#/features/flashcards/server/persistence";
import { requireAuthenticatedUserId } from "#/shared/lib/auth";

export const Route = createFileRoute("/api/session-summary")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const userId = await requireAuthenticatedUserId(request);

				if (!userId) {
					return json({ error: "Unauthorized." }, { status: 401 });
				}

				const payload = (await request.json()) as Partial<ReviewSessionSummary>;

				if (
					!payload.id ||
					!payload.languageId ||
					!payload.completedAt ||
					typeof payload.reviewedCount !== "number" ||
					typeof payload.newlyLearnedCount !== "number" ||
					typeof payload.correctCount !== "number" ||
					!payload.ratingBreakdown
				) {
					return json(
						{ error: "Invalid session summary payload." },
						{ status: 400 },
					);
				}

				const summary = await saveReviewSessionSummary(
					userId,
					payload as ReviewSessionSummary,
				);
				return json(summary);
			},
		},
	},
});
