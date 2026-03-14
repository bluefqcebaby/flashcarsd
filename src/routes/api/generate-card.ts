import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { generateCardSuggestion } from "#/features/flashcards/server/generate-card";
import { requireAuthenticatedUserId } from "#/shared/lib/auth";

export const Route = createFileRoute("/api/generate-card")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const userId = await requireAuthenticatedUserId(request);

				if (!userId) {
					return json({ error: "Unauthorized." }, { status: 401 });
				}

				const payload = (await request.json()) as {
					languageId?: string;
					prompt?: string;
				};

				if (!payload.languageId || !payload.prompt?.trim()) {
					return json(
						{
							error: "languageId and prompt are required.",
						},
						{ status: 400 },
					);
				}

				const suggestion = await generateCardSuggestion({
					languageId: payload.languageId,
					prompt: payload.prompt,
				});

				return json(suggestion);
			},
		},
	},
});
