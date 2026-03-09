import { getLanguageOption } from "#/features/flashcards/model/languages";
import type {
	CardAssistSuggestion,
	DifficultyLevel,
} from "#/features/flashcards/model/types";

type PhraseDraft = Omit<CardAssistSuggestion, "source">;

const LOCAL_ASSIST: Record<string, Record<string, PhraseDraft>> = {
	japanese: {
		いただきます: {
			translation: "thanks for the meal",
			example: "食べる前に「いただきます」と言います。",
			note: "Common phrase said before eating.",
			tags: ["daily", "ritual"],
			pronunciation: "itadakimasu",
			difficulty: "easy",
		},
		大丈夫: {
			translation: "it's okay / I'm fine",
			example: "荷物は自分で持てるので、大丈夫です。",
			note: "Useful for saying fine, safe, or no thanks depending on context.",
			tags: ["daily", "response"],
			pronunciation: "daijoubu",
			difficulty: "medium",
		},
	},
	georgian: {
		გამარჯობა: {
			translation: "hello",
			example: "gamarjoba, rogor khar?",
			note: "Common greeting; neutral and polite in everyday use.",
			tags: ["greeting", "daily", "polite"],
			pronunciation: "gamarjoba",
			difficulty: "easy",
		},
		gamarjoba: {
			translation: "hello",
			example: "gamarjoba, rogor khar?",
			note: "Common greeting; neutral and polite in everyday use.",
			tags: ["greeting", "daily", "polite"],
			pronunciation: "gamarjoba",
			difficulty: "easy",
		},
		მადლობა: {
			translation: "thank you",
			example: "dakhmarebistvis didi madloba.",
			note: "Basic polite phrase; neutral and useful in almost any context.",
			tags: ["daily", "polite"],
			pronunciation: "madloba",
			difficulty: "easy",
		},
		madloba: {
			translation: "thank you",
			example: "dakhmarebistvis didi madloba.",
			note: "Basic polite phrase; neutral and useful in almost any context.",
			tags: ["daily", "polite"],
			pronunciation: "madloba",
			difficulty: "easy",
		},
		გთხოვ: {
			translation: "please",
			example: "erti qava, gtkhov.",
			note: "Useful for quick requests; polite and common in daily speech.",
			tags: ["daily", "request"],
			pronunciation: "gtkhov",
			difficulty: "easy",
		},
		gtkhov: {
			translation: "please",
			example: "erti qava, gtkhov.",
			note: "Useful for quick requests; polite and common in daily speech.",
			tags: ["daily", "request"],
			pronunciation: "gtkhov",
			difficulty: "easy",
		},
	},
	spanish: {
		"me da igual": {
			translation: "I don't mind",
			example: "Si eliges tú el lugar, me da igual.",
			note: "Casual phrase for saying you have no preference.",
			tags: ["response", "casual"],
			pronunciation: "meh dah ee-GWAL",
			difficulty: "easy",
		},
	},
	french: {
		"ça marche": {
			translation: "that works",
			example: "On se retrouve à huit heures ? Ça marche.",
			note: "Common casual confirmation.",
			tags: ["response"],
			pronunciation: "sah marsh",
			difficulty: "easy",
		},
	},
	korean: {
		괜찮아요: {
			translation: "it's okay / no thanks",
			example: "물은 괜찮아요. 커피 주세요.",
			note: "Flexible polite phrase used in many daily situations.",
			tags: ["daily", "response"],
			pronunciation: "gwaen-cha-na-yo",
			difficulty: "medium",
		},
	},
	german: {
		"auf jeden Fall": {
			translation: "definitely",
			example: "Auf jeden Fall komme ich morgen vorbei.",
			note: "Very common spoken emphasis phrase.",
			tags: ["response", "spoken"],
			pronunciation: "owf YAY-den fall",
			difficulty: "medium",
		},
	},
	italian: {
		"ci penso io": {
			translation: "I'll take care of it",
			example: "Non preoccuparti, ci penso io.",
			note: "Useful phrase for taking responsibility.",
			tags: ["daily", "response"],
			pronunciation: "chee PEN-so ee-oh",
			difficulty: "medium",
		},
	},
};

function normalizePrompt(prompt: string) {
	return prompt.trim().toLowerCase();
}

function inferDifficulty(prompt: string): DifficultyLevel {
	if (prompt.length > 18 || prompt.split(/\s+/).length >= 4) {
		return "hard";
	}

	if (prompt.split(/\s+/).length >= 2) {
		return "medium";
	}

	return "easy";
}

function buildGenericExample(prompt: string, languageId: string) {
	switch (languageId) {
		case "japanese":
			return `${prompt} を会話で使う練習をする。`;
		case "georgian":
			return `Dghes "${prompt}" sitqvit mokle tsinadadeba gaakete.`;
		case "spanish":
			return `Intenta usar "${prompt}" en una frase corta hoy.`;
		case "french":
			return `Essaie d'utiliser "${prompt}" dans une phrase courte aujourd'hui.`;
		case "korean":
			return `오늘 "${prompt}" 를 넣어서 짧게 말해 보세요.`;
		case "german":
			return `Versuche heute "${prompt}" in einem kurzen Satz zu benutzen.`;
		case "italian":
			return `Prova a usare "${prompt}" in una frase breve oggi.`;
		default:
			return `Use "${prompt}" in a short sentence today.`;
	}
}

export function buildLocalCardAssist(
	languageId: string,
	prompt: string,
): CardAssistSuggestion {
	const normalized = normalizePrompt(prompt);
	const exactMatch = LOCAL_ASSIST[languageId]?.[normalized];

	if (exactMatch) {
		return {
			...exactMatch,
			source: "local",
		};
	}

	const language = getLanguageOption(languageId);
	const cleanedPrompt = prompt.trim();

	return {
		translation: `Edit English meaning for "${cleanedPrompt}"`,
		example: buildGenericExample(cleanedPrompt, languageId),
		note: `Local draft for ${language?.label ?? "this language"}. Check nuance before saving.`,
		tags: ["quick-add"],
		pronunciation: "",
		difficulty: inferDifficulty(cleanedPrompt),
		source: "local",
	};
}
