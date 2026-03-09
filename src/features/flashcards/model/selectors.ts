import {
	formatCompactDateTime,
	formatIntervalMinutes,
	formatPercent,
	relativeDayLabel,
	startOfDay,
} from "#/features/flashcards/model/format";
import {
	getLanguageOption,
	getNativeLanguageLabel,
} from "#/features/flashcards/model/languages";
import type {
	AppState,
	Flashcard,
	ReviewSessionSummary,
	ReviewStatus,
} from "#/features/flashcards/model/types";

const DAY = 24 * 60;

export function getCardsForLanguage(
	state: AppState,
	languageId: string | null,
) {
	if (!languageId) {
		return [];
	}

	return state.cards.filter((card) => card.languageId === languageId);
}

export function getDueCards(cards: Flashcard[], now = Date.now()) {
	return cards.filter((card) => new Date(card.dueAt).getTime() <= now);
}

export function getNextNewCards(cards: Flashcard[], limit = 5) {
	return cards
		.filter((card) => card.status === "new")
		.sort(
			(left, right) =>
				new Date(left.createdAt).getTime() -
				new Date(right.createdAt).getTime(),
		)
		.slice(0, limit);
}

export function buildStudyQueue(
	cards: Flashcard[],
	now = Date.now(),
	mode: "due" | "fresh" = "due",
) {
	const dueCards = getDueCards(cards, now);
	const reviewCards = dueCards.filter((card) => card.status !== "new");
	const newCards = dueCards.filter((card) => card.status === "new");
	const newLimit = mode === "fresh" ? 8 : reviewCards.length === 0 ? 5 : 3;

	return [...reviewCards, ...newCards.slice(0, newLimit)].sort(
		(left, right) => {
			const priority =
				getQueuePriority(left.status) - getQueuePriority(right.status);
			if (priority !== 0) {
				return priority;
			}

			const overdueDelta =
				new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
			if (overdueDelta !== 0) {
				return overdueDelta;
			}

			return (
				new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
			);
		},
	);
}

function getQueuePriority(status: ReviewStatus) {
	switch (status) {
		case "relearning":
			return 0;
		case "learning":
			return 1;
		case "review":
			return 2;
		case "new":
			return 3;
	}
}

function isSameDay(left: Date, right: Date) {
	return (
		left.getFullYear() === right.getFullYear() &&
		left.getMonth() === right.getMonth() &&
		left.getDate() === right.getDate()
	);
}

function getSuccessRate(cards: Flashcard[]) {
	const totals = cards.reduce(
		(accumulator, card) => {
			accumulator.correct += card.correctReviews;
			accumulator.total += card.reviews;
			return accumulator;
		},
		{ correct: 0, total: 0 },
	);

	if (totals.total === 0) {
		return 0;
	}

	return (totals.correct / totals.total) * 100;
}

function getStudyStreak(
	state: AppState,
	languageId: string | null,
	now = Date.now(),
) {
	if (!languageId) {
		return 0;
	}

	const sessionDates = state.reviewEvents
		.filter((event) => event.languageId === languageId)
		.map((event) => startOfDay(new Date(event.reviewedAt)).getTime());

	const uniqueDates = new Set(sessionDates);
	if (uniqueDates.size === 0) {
		return 0;
	}

	let streak = 0;
	let cursor = startOfDay(new Date(now)).getTime();

	while (uniqueDates.has(cursor)) {
		streak += 1;
		cursor -= 24 * 60 * 60 * 1000;
	}

	return streak;
}

function getForecast(cards: Flashcard[], now = Date.now()) {
	const start = startOfDay(new Date(now));

	return Array.from({ length: 7 }, (_, index) => {
		const day = new Date(start);
		day.setDate(start.getDate() + index);

		const count = cards.filter((card) =>
			isSameDay(new Date(card.dueAt), day),
		).length;
		return {
			label:
				index === 0
					? "Today"
					: new Intl.DateTimeFormat("en", { weekday: "short" }).format(day),
			count,
		};
	});
}

function getUpcomingLoadMessage(forecast: ReturnType<typeof getForecast>) {
	const tomorrow = forecast[1]?.count ?? 0;
	const peak = Math.max(...forecast.map((item) => item.count), 0);

	if (peak === 0) {
		return "Your queue is quiet for the week ahead.";
	}

	if (peak <= 4) {
		return `Tomorrow stays light at ${tomorrow} cards.`;
	}

	return `The busiest day ahead is ${peak} cards, so clearing today keeps the curve soft.`;
}

function getMasteryBuckets(cards: Flashcard[]) {
	return {
		fresh: cards.filter((card) => card.status === "new").length,
		familiar: cards.filter((card) => {
			if (card.status === "learning" || card.status === "relearning") {
				return true;
			}

			return card.status === "review" && card.intervalMinutes < 7 * DAY;
		}).length,
		solid: cards.filter(
			(card) =>
				card.status === "review" &&
				card.intervalMinutes >= 7 * DAY &&
				card.intervalMinutes < 30 * DAY,
		).length,
		mastered: cards.filter(
			(card) => card.status === "review" && card.intervalMinutes >= 30 * DAY,
		).length,
	};
}

function getHardCards(cards: Flashcard[]) {
	return [...cards]
		.filter((card) => card.lapses >= 2)
		.sort((left, right) => {
			const leftScore =
				left.lapses * 2 + left.wrongReviews - left.streak * 0.35;
			const rightScore =
				right.lapses * 2 + right.wrongReviews - right.streak * 0.35;
			return rightScore - leftScore;
		})
		.slice(0, 5)
		.map((card) => ({
			id: card.id,
			prompt: card.prompt,
			translation: card.translation,
			lapses: card.lapses,
			successRate:
				card.reviews === 0
					? 0
					: Math.round((card.correctReviews / card.reviews) * 100),
			nextDueLabel: relativeDayLabel(card.dueAt),
		}));
}

function getRecentlyAdded(cards: Flashcard[]) {
	return [...cards]
		.sort(
			(left, right) =>
				new Date(right.createdAt).getTime() -
				new Date(left.createdAt).getTime(),
		)
		.slice(0, 5)
		.map((card) => ({
			id: card.id,
			prompt: card.prompt,
			translation: card.translation,
			createdAtLabel: relativeDayLabel(card.createdAt),
			status: card.status,
		}));
}

function getSummaryLabel(summary: ReviewSessionSummary | null) {
	if (!summary) {
		return "No completed session yet";
	}

	return `${summary.reviewedCount} cards on ${formatCompactDateTime(summary.completedAt)}`;
}

function getInsightMessage(
	cards: Flashcard[],
	dueCards: Flashcard[],
	retention: number,
	streak: number,
) {
	if (cards.length === 0) {
		return "Start with a few practical words. The dashboard will get sharper as your deck grows.";
	}

	if (dueCards.length === 0) {
		return "No cards are due today. Add new cards or study fresh ones if you want.";
	}

	const overdueCount = dueCards.filter(
		(card) => new Date(card.dueAt).getTime() < Date.now() - 12 * 60 * 60 * 1000,
	).length;
	if (overdueCount >= 3) {
		return `You have ${overdueCount} older cards waiting. A small repair session will smooth the next few days.`;
	}

	if (streak >= 5 && retention >= 80) {
		return `${formatPercent(retention)} retention across a ${streak}-day streak.`;
	}

	if (retention === 0) {
		return "You have cards ready. One review pass will start building your pacing and retention picture.";
	}

	return `${dueCards.length} cards are ready now. Clearing them keeps the next week balanced.`;
}

export function getDashboardSnapshot(state: AppState, now = Date.now()) {
	const activeLanguage = getLanguageOption(state.settings.activeLanguageId);
	const cards = getCardsForLanguage(state, state.settings.activeLanguageId);
	const dueCards = getDueCards(cards, now);
	const overdueCards = dueCards.filter(
		(card) => new Date(card.dueAt).getTime() < now - 6 * 60 * 60 * 1000,
	);
	const forecast = getForecast(cards, now);
	const mastery = getMasteryBuckets(cards);
	const retention = getSuccessRate(cards);
	const lastSession =
		state.lastSessionSummary?.languageId === state.settings.activeLanguageId
			? state.lastSessionSummary
			: null;

	const learnedCount = cards.filter(
		(card) => card.status === "review" && card.intervalMinutes >= 30 * DAY,
	).length;
	const addedThisWeek = cards.filter((card) => {
		const createdAt = new Date(card.createdAt).getTime();
		return createdAt >= now - 7 * 24 * 60 * 60 * 1000;
	}).length;
	const dueNewCount = dueCards.filter((card) => card.status === "new").length;
	const dueReviewCount = dueCards.length - dueNewCount;
	const hasReviewData = cards.some((card) => card.reviews > 0);

	return {
		activeLanguage,
		nativeLanguageLabel: getNativeLanguageLabel(
			state.settings.nativeLanguageId,
		),
		cardCount: cards.length,
		dueCount: dueCards.length,
		overdueCount: overdueCards.length,
		dueNewCount,
		dueReviewCount,
		addedThisWeek,
		retention,
		hasReviewData,
		streak: getStudyStreak(state, state.settings.activeLanguageId, now),
		learnedCount,
		mastery,
		forecast,
		forecastMessage: getUpcomingLoadMessage(forecast),
		hardCards: getHardCards(cards),
		recentlyAdded: getRecentlyAdded(cards),
		lastSession,
		lastSessionLabel: getSummaryLabel(lastSession),
		nextNewCards: getNextNewCards(cards, 3),
		insightMessage: getInsightMessage(
			cards,
			dueCards,
			retention,
			getStudyStreak(state, state.settings.activeLanguageId, now),
		),
	};
}

export function getCardStatusLabel(card: Flashcard) {
	switch (card.status) {
		case "new":
			return "Fresh";
		case "learning":
			return "Learning";
		case "relearning":
			return "Relearning";
		case "review":
			return card.intervalMinutes >= 14 * DAY ? "Stable" : "Review";
	}
}

export function getDueBadgeLabel(card: Flashcard) {
	return new Date(card.dueAt).getTime() <= Date.now()
		? "Ready now"
		: `Due ${relativeDayLabel(card.dueAt)}`;
}

export function getReviewSummaryLine(card: Flashcard) {
	if (card.reviews === 0) {
		return "Fresh card";
	}

	const successRate = Math.round(
		(card.correctReviews / Math.max(1, card.reviews)) * 100,
	);
	return `${formatPercent(successRate)} hit rate • ${card.lapses} lapse${card.lapses === 1 ? "" : "s"} • ${formatIntervalMinutes(card.intervalMinutes)} interval`;
}
