import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { AddCardInput } from "#/features/flashcards/model/types";
import { addFlashcard } from "#/features/flashcards/server/persistence";

export const Route = createFileRoute("/api/cards")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const payload = (await request.json()) as Partial<AddCardInput>;

				if (
					!payload.languageId ||
					!payload.prompt?.trim() ||
					!payload.translation?.trim()
				) {
					return json(
						{ error: "languageId, prompt, and translation are required." },
						{ status: 400 },
					);
				}

				const result = await addFlashcard({
					languageId: payload.languageId,
					prompt: payload.prompt,
					translation: payload.translation,
					example: payload.example,
					note: payload.note,
					tags: payload.tags,
					pronunciation: payload.pronunciation,
					difficulty: payload.difficulty,
				});

				return json(result, { status: result.ok ? 200 : 409 });
			},
		},
	},
});
