import OpenAI from "openai";

import { buildLocalCardAssist } from "#/features/flashcards/model/card-assist";
import { getLanguageOption } from "#/features/flashcards/model/languages";
import type { CardAssistSuggestion } from "#/features/flashcards/model/types";
import { getEnvVar, getOpenAIModel } from "#/shared/lib/env";

interface GenerateCardInput {
	languageId: string;
	prompt: string;
}

function parseJsonSuggestion(
	input: string,
): Omit<CardAssistSuggestion, "source"> | null {
	try {
		const parsed = JSON.parse(input) as Partial<CardAssistSuggestion>;
		if (
			typeof parsed.translation !== "string" ||
			typeof parsed.example !== "string" ||
			typeof parsed.note !== "string" ||
			typeof parsed.pronunciation !== "string" ||
			!Array.isArray(parsed.tags) ||
			(parsed.difficulty !== "easy" &&
				parsed.difficulty !== "medium" &&
				parsed.difficulty !== "hard")
		) {
			return null;
		}

		return {
			translation: parsed.translation.trim(),
			example: parsed.example.trim(),
			note: parsed.note.trim(),
			pronunciation: parsed.pronunciation.trim(),
			tags: parsed.tags
				.filter((tag): tag is string => typeof tag === "string")
				.slice(0, 4),
			difficulty: parsed.difficulty,
		};
	} catch {
		return null;
	}
}

function logRequest(languageLabel: string, prompt: string) {
	console.info("[generate-card] OpenAI request", {
		language: languageLabel,
		prompt,
	});
}

function logResponse(outputText: string) {
	console.info("[generate-card] OpenAI response", {
		outputText,
	});
}

export async function generateCardSuggestion({
	languageId,
	prompt,
}: GenerateCardInput): Promise<CardAssistSuggestion> {
	const cleanedPrompt = prompt.trim();
	const apiKey = getEnvVar("OPENAI_API_KEY");

	if (!apiKey) {
		console.warn(
			"[generate-card] Missing OPENAI_API_KEY, using local fallback",
			{
				languageId,
				prompt: cleanedPrompt,
			},
		);
		return buildLocalCardAssist(languageId, cleanedPrompt);
	}

	const language = getLanguageOption(languageId);
	if (!language) {
		console.warn("[generate-card] Unknown language, using local fallback", {
			languageId,
			prompt: cleanedPrompt,
		});
		return buildLocalCardAssist(languageId, cleanedPrompt);
	}

	try {
		const client = new OpenAI({ apiKey });
		logRequest(language.label, cleanedPrompt);
		const response = await client.responses.create({
			model: getOpenAIModel(),
			instructions: `You create high-quality vocabulary flashcard drafts for language learners.

Output a structured flashcard suggestion with:
- translation: concise English meaning only
- example: one short natural example sentence in the target language
- note: one short English usage note with helpful metadata such as formality, tone, register, script hint, or when the phrase is used
- pronunciation: pronunciation, transliteration, or reading in Latin characters when helpful
- tags: 1 to 4 short lowercase tags
- difficulty: easy, medium, or hard

Rules:
- The translation must be in English, never in the target language.
- If the user enters transliteration or romanization, infer the original target-language meaning.
- If the target language is Georgian, output the example and pronunciation in Latin transliteration only, never in Georgian script.
- Prefer practical meaning over literal gloss.
- The note should be genuinely helpful, for example "common greeting, neutral-polite" or "casual reply, often used with friends".
- Do not include markdown.`,
			input: `Target language: ${language.label}
User input: ${cleanedPrompt}`,
			reasoning: {
				effort: "minimal",
			},
			text: {
				verbosity: "low",
				format: {
					type: "json_schema",
					name: "flashcard_suggestion",
					strict: true,
					schema: {
						type: "object",
						additionalProperties: false,
						properties: {
							translation: { type: "string" },
							example: { type: "string" },
							note: { type: "string" },
							pronunciation: { type: "string" },
							tags: {
								type: "array",
								items: { type: "string" },
								minItems: 1,
								maxItems: 4,
							},
							difficulty: {
								type: "string",
								enum: ["easy", "medium", "hard"],
							},
						},
						required: [
							"translation",
							"example",
							"note",
							"pronunciation",
							"tags",
							"difficulty",
						],
					},
				},
			},
			max_output_tokens: 320,
		});
		logResponse(response.output_text);

		const parsed = parseJsonSuggestion(response.output_text);
		if (!parsed) {
			console.warn(
				"[generate-card] Could not parse OpenAI response, using local fallback",
				{
					languageId,
					prompt: cleanedPrompt,
				},
			);
			return buildLocalCardAssist(languageId, cleanedPrompt);
		}

		return {
			...parsed,
			source: "openai",
		};
	} catch (error) {
		console.error(
			"[generate-card] OpenAI request failed, using local fallback",
			{
				languageId,
				prompt: cleanedPrompt,
				error: error instanceof Error ? error.message : String(error),
			},
		);
		return buildLocalCardAssist(languageId, cleanedPrompt);
	}
}
