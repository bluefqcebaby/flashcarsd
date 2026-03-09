import type {
	AppState,
	CompleteOnboardingInput,
	Flashcard,
	LanguageProfile,
	ReviewEvent,
	ReviewSessionSummary,
} from "#/features/flashcards/model/types";

const HOUR = 60;
const DAY = 24 * HOUR;

interface SeedTemplate {
	prompt: string;
	translation: string;
	example: string;
	note: string;
	pronunciation: string;
	tags: string[];
	difficulty: Flashcard["difficulty"];
	status: Flashcard["status"];
	dueOffsetMinutes: number;
	intervalMinutes: number;
	ease: number;
	reviews: number;
	correctReviews: number;
	wrongReviews: number;
	lapses: number;
	streak: number;
	createdOffsetMinutes: number;
}

const STARTER_DECKS: Record<string, SeedTemplate[]> = {
	georgian: [
		{
			prompt: "madloba",
			translation: "thank you",
			example: "dakhmarebistvis didi madloba.",
			note: "Core polite phrase; easy first card.",
			pronunciation: "madloba",
			tags: ["polite", "daily"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: -DAY,
			intervalMinutes: 5 * DAY,
			ease: 2.28,
			reviews: 8,
			correctReviews: 7,
			wrongReviews: 1,
			lapses: 1,
			streak: 4,
			createdOffsetMinutes: -20 * DAY,
		},
		{
			prompt: "gtkhov",
			translation: "please",
			example: "erti qava, gtkhov.",
			note: "Useful for simple requests.",
			pronunciation: "gtkhov",
			tags: ["request", "daily"],
			difficulty: "easy",
			status: "learning",
			dueOffsetMinutes: 40,
			intervalMinutes: 8 * HOUR,
			ease: 2.12,
			reviews: 2,
			correctReviews: 2,
			wrongReviews: 0,
			lapses: 0,
			streak: 2,
			createdOffsetMinutes: -DAY,
		},
		{
			prompt: "rogor khar?",
			translation: "how are you?",
			example: "gamarjoba, rogor khar?",
			note: "Basic greeting phrase.",
			pronunciation: "rogor khar",
			tags: ["greeting"],
			difficulty: "easy",
			status: "new",
			dueOffsetMinutes: 0,
			intervalMinutes: 0,
			ease: 2.3,
			reviews: 0,
			correctReviews: 0,
			wrongReviews: 0,
			lapses: 0,
			streak: 0,
			createdOffsetMinutes: -20,
		},
		{
			prompt: "minda",
			translation: "I want",
			example: "me tsqali minda.",
			note: "Useful base verb for requests and preferences.",
			pronunciation: "minda",
			tags: ["verb", "daily"],
			difficulty: "medium",
			status: "review",
			dueOffsetMinutes: 3 * HOUR,
			intervalMinutes: 4 * DAY,
			ease: 2.2,
			reviews: 5,
			correctReviews: 4,
			wrongReviews: 1,
			lapses: 1,
			streak: 2,
			createdOffsetMinutes: -10 * DAY,
		},
		{
			prompt: "akhla",
			translation: "now",
			example: "akhla dro ar maqvs.",
			note: "Short, common time word.",
			pronunciation: "akhla",
			tags: ["time"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: 2 * DAY,
			intervalMinutes: 8 * DAY,
			ease: 2.42,
			reviews: 5,
			correctReviews: 5,
			wrongReviews: 0,
			lapses: 0,
			streak: 5,
			createdOffsetMinutes: -16 * DAY,
		},
		{
			prompt: "ver gavige",
			translation: "I didn't understand",
			example: "bodishi, ver gavige.",
			note: "Useful repair phrase when listening fails.",
			pronunciation: "ver gavige",
			tags: ["repair", "listening"],
			difficulty: "hard",
			status: "relearning",
			dueOffsetMinutes: -24,
			intervalMinutes: 12,
			ease: 1.7,
			reviews: 6,
			correctReviews: 4,
			wrongReviews: 2,
			lapses: 2,
			streak: 0,
			createdOffsetMinutes: -12 * DAY,
		},
	],
	japanese: [
		{
			prompt: "いただきます",
			translation: "Thanks for the meal",
			example: "食べる前に「いただきます」と言います。",
			note: "A set phrase before eating; think of it as receiving the meal gratefully.",
			pronunciation: "itadakimasu",
			tags: ["ritual", "daily"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: -2 * DAY,
			intervalMinutes: 6 * DAY,
			ease: 2.25,
			reviews: 9,
			correctReviews: 8,
			wrongReviews: 1,
			lapses: 1,
			streak: 4,
			createdOffsetMinutes: -28 * DAY,
		},
		{
			prompt: "大丈夫",
			translation: "I'm okay / it's fine",
			example: "荷物は自分で持てるので、大丈夫です。",
			note: "Very flexible: okay, safe, no thanks, don't worry.",
			pronunciation: "daijoubu",
			tags: ["response", "daily"],
			difficulty: "medium",
			status: "relearning",
			dueOffsetMinutes: -30,
			intervalMinutes: 12,
			ease: 1.72,
			reviews: 7,
			correctReviews: 5,
			wrongReviews: 2,
			lapses: 2,
			streak: 0,
			createdOffsetMinutes: -19 * DAY,
		},
		{
			prompt: "ゆっくり",
			translation: "slowly / take your time",
			example: "もっとゆっくり話してください。",
			note: "Useful when asking someone to slow down.",
			pronunciation: "yukkuri",
			tags: ["travel", "pace"],
			difficulty: "easy",
			status: "learning",
			dueOffsetMinutes: 80,
			intervalMinutes: 8 * HOUR,
			ease: 2.1,
			reviews: 2,
			correctReviews: 2,
			wrongReviews: 0,
			lapses: 0,
			streak: 2,
			createdOffsetMinutes: -2 * DAY,
		},
		{
			prompt: "駅",
			translation: "station",
			example: "駅はこの道をまっすぐです。",
			note: "A travel noun you see often on signs.",
			pronunciation: "eki",
			tags: ["travel", "noun"],
			difficulty: "easy",
			status: "new",
			dueOffsetMinutes: 0,
			intervalMinutes: 0,
			ease: 2.3,
			reviews: 0,
			correctReviews: 0,
			wrongReviews: 0,
			lapses: 0,
			streak: 0,
			createdOffsetMinutes: -50,
		},
		{
			prompt: "お願いします",
			translation: "please / I'd like that",
			example: "コーヒーを一つお願いします。",
			note: "Pairs well with requests in shops and cafes.",
			pronunciation: "onegaishimasu",
			tags: ["polite", "request"],
			difficulty: "medium",
			status: "review",
			dueOffsetMinutes: 6 * HOUR,
			intervalMinutes: 4 * DAY,
			ease: 2.36,
			reviews: 6,
			correctReviews: 5,
			wrongReviews: 1,
			lapses: 1,
			streak: 3,
			createdOffsetMinutes: -15 * DAY,
		},
		{
			prompt: "眠い",
			translation: "sleepy",
			example: "今日は朝から眠いです。",
			note: "Short and handy; final い marks an adjective.",
			pronunciation: "nemui",
			tags: ["feeling"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: 2 * DAY,
			intervalMinutes: 8 * DAY,
			ease: 2.42,
			reviews: 5,
			correctReviews: 5,
			wrongReviews: 0,
			lapses: 0,
			streak: 5,
			createdOffsetMinutes: -22 * DAY,
		},
	],
	spanish: [
		{
			prompt: "me da igual",
			translation: "I don't mind",
			example: "Si eliges tú el lugar, me da igual.",
			note: "Literally 'it gives me the same'; a common casual reply.",
			pronunciation: "meh dah ee-GWAL",
			tags: ["response", "casual"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: -DAY,
			intervalMinutes: 5 * DAY,
			ease: 2.32,
			reviews: 8,
			correctReviews: 7,
			wrongReviews: 1,
			lapses: 1,
			streak: 4,
			createdOffsetMinutes: -18 * DAY,
		},
		{
			prompt: "qué ganas",
			translation: "I'm really looking forward to it",
			example: "Mañana empieza el viaje. ¡Qué ganas!",
			note: "Expressive phrase for excitement.",
			pronunciation: "keh GAH-nas",
			tags: ["emotion"],
			difficulty: "medium",
			status: "new",
			dueOffsetMinutes: 0,
			intervalMinutes: 0,
			ease: 2.3,
			reviews: 0,
			correctReviews: 0,
			wrongReviews: 0,
			lapses: 0,
			streak: 0,
			createdOffsetMinutes: -40,
		},
		{
			prompt: "todavía",
			translation: "still / yet",
			example: "Todavía no he comido.",
			note: "Handy adverb that shows up constantly.",
			pronunciation: "toh-dah-VEE-ah",
			tags: ["connector"],
			difficulty: "medium",
			status: "review",
			dueOffsetMinutes: 4 * HOUR,
			intervalMinutes: 3 * DAY,
			ease: 2.18,
			reviews: 4,
			correctReviews: 3,
			wrongReviews: 1,
			lapses: 1,
			streak: 2,
			createdOffsetMinutes: -9 * DAY,
		},
		{
			prompt: "qué rico",
			translation: "so tasty",
			example: "Este café está qué rico.",
			note: "In some regions people simply say 'rico' for tasty.",
			pronunciation: "keh REE-koh",
			tags: ["food", "reaction"],
			difficulty: "easy",
			status: "learning",
			dueOffsetMinutes: 45,
			intervalMinutes: 8 * HOUR,
			ease: 2.1,
			reviews: 2,
			correctReviews: 2,
			wrongReviews: 0,
			lapses: 0,
			streak: 2,
			createdOffsetMinutes: -DAY,
		},
		{
			prompt: "de una",
			translation: "absolutely / let's do it",
			example: "¿Vamos al mercado? De una.",
			note: "Very colloquial; great for quick replies.",
			pronunciation: "deh OO-nah",
			tags: ["casual", "response"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: 3 * DAY,
			intervalMinutes: 9 * DAY,
			ease: 2.44,
			reviews: 6,
			correctReviews: 6,
			wrongReviews: 0,
			lapses: 0,
			streak: 6,
			createdOffsetMinutes: -24 * DAY,
		},
		{
			prompt: "se me fue",
			translation: "it slipped my mind",
			example: "Perdón, se me fue responderte.",
			note: "Useful apology phrase for forgetting something.",
			pronunciation: "seh meh fweh",
			tags: ["apology"],
			difficulty: "hard",
			status: "relearning",
			dueOffsetMinutes: -20,
			intervalMinutes: 12,
			ease: 1.68,
			reviews: 5,
			correctReviews: 3,
			wrongReviews: 2,
			lapses: 2,
			streak: 0,
			createdOffsetMinutes: -13 * DAY,
		},
	],
	french: [
		{
			prompt: "ça marche",
			translation: "that works / sounds good",
			example: "On se retrouve à huit heures ? Ça marche.",
			note: "An easy everyday confirmation phrase.",
			pronunciation: "sah marsh",
			tags: ["response"],
			difficulty: "easy",
			status: "review",
			dueOffsetMinutes: -8 * HOUR,
			intervalMinutes: 4 * DAY,
			ease: 2.24,
			reviews: 7,
			correctReviews: 6,
			wrongReviews: 1,
			lapses: 1,
			streak: 3,
			createdOffsetMinutes: -17 * DAY,
		},
		{
			prompt: "du coup",
			translation: "so / as a result",
			example: "J'étais déjà là, du coup je suis entré.",
			note: "Extremely common discourse marker.",
			pronunciation: "dy koo",
			tags: ["connector"],
			difficulty: "medium",
			status: "new",
			dueOffsetMinutes: 0,
			intervalMinutes: 0,
			ease: 2.3,
			reviews: 0,
			correctReviews: 0,
			wrongReviews: 0,
			lapses: 0,
			streak: 0,
			createdOffsetMinutes: -15,
		},
		{
			prompt: "pas grave",
			translation: "no worries",
			example: "Tu es en retard ? Pas grave.",
			note: "Compact, common reassurance phrase.",
			pronunciation: "pah grav",
			tags: ["reassurance"],
			difficulty: "easy",
			status: "learning",
			dueOffsetMinutes: 35,
			intervalMinutes: 8 * HOUR,
			ease: 2.12,
			reviews: 2,
			correctReviews: 2,
			wrongReviews: 0,
			lapses: 0,
			streak: 2,
			createdOffsetMinutes: -DAY,
		},
		{
			prompt: "j'ai hâte",
			translation: "I can't wait",
			example: "J'ai hâte de visiter Lyon.",
			note: "Use it with 'de' and an infinitive or noun phrase.",
			pronunciation: "zhay aht",
			tags: ["emotion"],
			difficulty: "medium",
			status: "review",
			dueOffsetMinutes: 7 * HOUR,
			intervalMinutes: 5 * DAY,
			ease: 2.36,
			reviews: 5,
			correctReviews: 5,
			wrongReviews: 0,
			lapses: 0,
			streak: 5,
			createdOffsetMinutes: -10 * DAY,
		},
	],
};

function createId(prefix: string, now: number, index: number) {
	return `${prefix}-${now}-${index}`;
}

function createCard(
	languageId: string,
	template: SeedTemplate,
	now: number,
	index: number,
): Flashcard {
	return {
		id: createId(languageId, now, index),
		languageId,
		prompt: template.prompt,
		translation: template.translation,
		example: template.example,
		note: template.note,
		tags: template.tags,
		pronunciation: template.pronunciation,
		difficulty: template.difficulty,
		createdAt: new Date(
			now + template.createdOffsetMinutes * 60 * 1000,
		).toISOString(),
		updatedAt: new Date(
			now + template.createdOffsetMinutes * 60 * 1000,
		).toISOString(),
		status: template.status,
		dueAt: new Date(now + template.dueOffsetMinutes * 60 * 1000).toISOString(),
		lastReviewedAt:
			template.reviews > 0
				? new Date(
						now +
							(template.dueOffsetMinutes - template.intervalMinutes) *
								60 *
								1000,
					).toISOString()
				: null,
		intervalMinutes: template.intervalMinutes,
		lastIntervalMinutes: Math.max(
			0,
			Math.round(template.intervalMinutes * 0.7),
		),
		ease: template.ease,
		stepIndex:
			template.status === "learning" || template.status === "relearning"
				? 1
				: 0,
		lapses: template.lapses,
		reviews: template.reviews,
		correctReviews: template.correctReviews,
		wrongReviews: template.wrongReviews,
		streak: template.streak,
	};
}

function createReviewEvents(
	languageId: string,
	cards: Flashcard[],
	now: number,
): ReviewEvent[] {
	const timeline = [-6, -5, -4, -3, -2, -1, 0];
	const ratings: ReviewEvent["rating"][] = [
		"good",
		"excellent",
		"good",
		"ok",
		"good",
		"dontKnow",
		"good",
	];

	return timeline.flatMap((daysBack, index) => {
		const card = cards[index % cards.length];
		if (!card || card.reviews === 0) {
			return [];
		}

		return [
			{
				id: `seed-review-${languageId}-${index}`,
				cardId: card.id,
				languageId,
				rating: ratings[index % ratings.length],
				reviewedAt: new Date(
					now + daysBack * DAY * 60 * 1000 + 18 * HOUR * 60 * 1000,
				).toISOString(),
				previousStatus:
					card.status === "review" ? "review" : ("learning" as const),
				nextStatus: card.status,
				previousIntervalMinutes: Math.max(
					HOUR,
					Math.round(card.intervalMinutes * 0.8),
				),
				nextIntervalMinutes: card.intervalMinutes,
			},
		];
	});
}

function createSessionSummary(
	languageId: string,
	reviewedCount: number,
	now: number,
): ReviewSessionSummary {
	return {
		id: `summary-${languageId}-${now}`,
		languageId,
		completedAt: new Date(now - 18 * HOUR * 60 * 1000).toISOString(),
		reviewedCount,
		newlyLearnedCount: 1,
		correctCount: Math.max(0, reviewedCount - 1),
		ratingBreakdown: {
			dontKnow: 1,
			ok: 1,
			good: Math.max(1, reviewedCount - 2),
			excellent: 1,
		},
	};
}

export function buildStarterDeck(
	input: CompleteOnboardingInput,
	now = Date.now(),
) {
	const templates =
		STARTER_DECKS[input.targetLanguageId] ?? STARTER_DECKS.japanese;
	const cards = templates.map((template, index) =>
		createCard(input.targetLanguageId, template, now, index),
	);
	const profile: LanguageProfile = {
		languageId: input.targetLanguageId,
		nativeLanguageId: input.nativeLanguageId,
		createdAt: new Date(now).toISOString(),
		starterDeckLoaded: true,
	};

	return {
		profile,
		cards,
		reviewEvents: createReviewEvents(input.targetLanguageId, cards, now),
		lastSessionSummary: createSessionSummary(input.targetLanguageId, 4, now),
	};
}

export function ensureLanguageProfile(
	state: AppState,
	languageId: string,
	nativeLanguageId: string,
): AppState {
	if (state.languageProfiles[languageId]) {
		return state;
	}

	return {
		...state,
		languageProfiles: {
			...state.languageProfiles,
			[languageId]: {
				languageId,
				nativeLanguageId,
				createdAt: new Date().toISOString(),
				starterDeckLoaded: false,
			},
		},
	};
}
