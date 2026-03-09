import {
	clamp,
	formatIntervalMinutes,
} from "#/features/flashcards/model/format";
import type {
	Flashcard,
	IntervalPreview,
	ReviewRating,
	ReviewResult,
	ReviewStatus,
} from "#/features/flashcards/model/types";

const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const LEARNING_STEPS = [10 * MINUTE, 8 * HOUR] as const;
const RELEARNING_STEPS = [12 * MINUTE, 12 * HOUR] as const;
const MIN_EASE = 1.35;
const MAX_EASE = 2.8;

function addMinutes(timestamp: number, minutes: number) {
	return new Date(timestamp + minutes * 60 * 1000).toISOString();
}

function getMinutesOverdue(card: Flashcard, now: number) {
	return Math.max(0, (now - new Date(card.dueAt).getTime()) / (60 * 1000));
}

function getReviewMultiplier(card: Flashcard, now: number) {
	const overdueDays = getMinutesOverdue(card, now) / DAY;
	return 1 + Math.min(0.38, overdueDays * 0.08);
}

function getLearningPlan(status: ReviewStatus) {
	return status === "relearning" ? RELEARNING_STEPS : LEARNING_STEPS;
}

function buildCard(card: Flashcard, patch: Partial<Flashcard>) {
	return {
		...card,
		...patch,
	};
}

function getLearningTransition(
	card: Flashcard,
	rating: ReviewRating,
	now: number,
) {
	const plan = getLearningPlan(card.status);

	if (rating === "dontKnow") {
		return buildCard(card, {
			status: card.status === "relearning" ? "relearning" : "learning",
			stepIndex: 0,
			lapses: card.lapses + 1,
			streak: 0,
			ease: clamp(card.ease - 0.16, MIN_EASE, MAX_EASE),
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: plan[0],
			dueAt: addMinutes(now, plan[0]),
		});
	}

	if (rating === "ok") {
		const nextStep = Math.min(card.stepIndex + 1, plan.length - 1);
		return buildCard(card, {
			status: card.status === "relearning" ? "relearning" : "learning",
			stepIndex: nextStep,
			streak: card.streak + 1,
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: plan[nextStep],
			dueAt: addMinutes(now, plan[nextStep]),
		});
	}

	if (rating === "good") {
		const graduateInterval = card.status === "relearning" ? 1.5 * DAY : 2 * DAY;
		return buildCard(card, {
			status: "review",
			stepIndex: 0,
			streak: card.streak + 1,
			ease: clamp(card.ease + 0.04, MIN_EASE, MAX_EASE),
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: graduateInterval,
			dueAt: addMinutes(now, graduateInterval),
		});
	}

	const excellentInterval = card.status === "relearning" ? 3 * DAY : 4 * DAY;
	return buildCard(card, {
		status: "review",
		stepIndex: 0,
		streak: card.streak + 1,
		ease: clamp(card.ease + 0.1, MIN_EASE, MAX_EASE),
		lastIntervalMinutes: card.intervalMinutes,
		intervalMinutes: excellentInterval,
		dueAt: addMinutes(now, excellentInterval),
	});
}

function getReviewTransition(
	card: Flashcard,
	rating: ReviewRating,
	now: number,
) {
	const overdueMultiplier = getReviewMultiplier(card, now);

	if (rating === "dontKnow") {
		return buildCard(card, {
			status: "relearning",
			stepIndex: 0,
			lapses: card.lapses + 1,
			streak: 0,
			ease: clamp(card.ease - 0.2, MIN_EASE, MAX_EASE),
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: RELEARNING_STEPS[0],
			dueAt: addMinutes(now, RELEARNING_STEPS[0]),
		});
	}

	if (rating === "ok") {
		const nextInterval = Math.max(
			DAY,
			Math.round(card.intervalMinutes * 1.2 * overdueMultiplier),
		);
		return buildCard(card, {
			status: "review",
			stepIndex: 0,
			streak: card.streak + 1,
			ease: clamp(card.ease - 0.04, MIN_EASE, MAX_EASE),
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: nextInterval,
			dueAt: addMinutes(now, nextInterval),
		});
	}

	if (rating === "good") {
		const nextInterval = Math.max(
			1.5 * DAY,
			Math.round(card.intervalMinutes * card.ease * overdueMultiplier),
		);
		return buildCard(card, {
			status: "review",
			stepIndex: 0,
			streak: card.streak + 1,
			ease: clamp(card.ease + 0.03, MIN_EASE, MAX_EASE),
			lastIntervalMinutes: card.intervalMinutes,
			intervalMinutes: nextInterval,
			dueAt: addMinutes(now, nextInterval),
		});
	}

	const nextInterval = Math.max(
		3 * DAY,
		Math.round(
			card.intervalMinutes * (card.ease + 0.38) * (overdueMultiplier + 0.04),
		),
	);

	return buildCard(card, {
		status: "review",
		stepIndex: 0,
		streak: card.streak + 1,
		ease: clamp(card.ease + 0.1, MIN_EASE, MAX_EASE),
		lastIntervalMinutes: card.intervalMinutes,
		intervalMinutes: nextInterval,
		dueAt: addMinutes(now, nextInterval),
	});
}

export function getNextCardState(
	card: Flashcard,
	rating: ReviewRating,
	now = Date.now(),
) {
	const basePatch = {
		updatedAt: new Date(now).toISOString(),
		lastReviewedAt: new Date(now).toISOString(),
		reviews: card.reviews + 1,
		correctReviews: card.correctReviews + (rating === "dontKnow" ? 0 : 1),
		wrongReviews: card.wrongReviews + (rating === "dontKnow" ? 1 : 0),
	};

	const nextCard =
		card.status === "review"
			? getReviewTransition(card, rating, now)
			: getLearningTransition(card, rating, now);

	return {
		...nextCard,
		...basePatch,
	};
}

export function reviewFlashcard(
	card: Flashcard,
	rating: ReviewRating,
	now = Date.now(),
): ReviewResult {
	const nextCard = getNextCardState(card, rating, now);

	return {
		card: nextCard,
		event: {
			id: `review-${card.id}-${now}`,
			cardId: card.id,
			languageId: card.languageId,
			rating,
			reviewedAt: new Date(now).toISOString(),
			previousStatus: card.status,
			nextStatus: nextCard.status,
			previousIntervalMinutes: card.intervalMinutes,
			nextIntervalMinutes: nextCard.intervalMinutes,
		},
	};
}

export function getSchedulingPreviews(
	card: Flashcard,
	now = Date.now(),
): IntervalPreview[] {
	const ratings: ReviewRating[] = ["dontKnow", "ok", "good", "excellent"];

	return ratings.map((rating) => {
		const nextCard = getNextCardState(card, rating, now);
		return {
			rating,
			label: formatIntervalMinutes(nextCard.intervalMinutes),
			minutes: nextCard.intervalMinutes,
		};
	});
}
