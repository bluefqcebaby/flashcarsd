import { asc, desc, eq, sql } from "drizzle-orm";

import {
	APP_SETTINGS_ROW_ID,
	createDefaultAppSettings,
} from "#/features/flashcards/model/app-state";
import {
	getComparablePrompt,
	normalizeExampleStorage,
	normalizePromptStorage,
} from "#/features/flashcards/model/display";
import { buildStarterDeck } from "#/features/flashcards/model/seed";
import { reviewFlashcard } from "#/features/flashcards/model/srs";
import type {
	AddCardInput,
	AppDataSnapshot,
	AppSettings,
	CompleteOnboardingInput,
	Flashcard,
	ReviewEvent,
	ReviewRating,
	ReviewResult,
	ReviewSessionSummary,
} from "#/features/flashcards/model/types";
import { getDb } from "#/shared/db/client";
import {
	appSettings,
	flashcards,
	reviewEvents,
	reviewSessionSummaries,
} from "#/shared/db/schema";

function toIsoString(value: Date | string | null) {
	if (!value) {
		return null;
	}

	return new Date(value).toISOString();
}

function mapFlashcard(row: typeof flashcards.$inferSelect): Flashcard {
	return {
		id: row.id,
		languageId: row.languageId,
		prompt: row.prompt,
		translation: row.translation,
		example: row.example,
		note: row.note,
		tags: row.tags ?? [],
		pronunciation: row.pronunciation,
		difficulty: row.difficulty as Flashcard["difficulty"],
		createdAt: new Date(row.createdAt).toISOString(),
		updatedAt: new Date(row.updatedAt).toISOString(),
		status: row.status as Flashcard["status"],
		dueAt: new Date(row.dueAt).toISOString(),
		lastReviewedAt: toIsoString(row.lastReviewedAt),
		intervalMinutes: row.intervalMinutes,
		lastIntervalMinutes: row.lastIntervalMinutes,
		ease: row.ease,
		stepIndex: row.stepIndex,
		lapses: row.lapses,
		reviews: row.reviews,
		correctReviews: row.correctReviews,
		wrongReviews: row.wrongReviews,
		streak: row.streak,
	};
}

function mapReviewEvent(row: typeof reviewEvents.$inferSelect): ReviewEvent {
	return {
		id: row.id,
		cardId: row.cardId,
		languageId: row.languageId,
		rating: row.rating as ReviewRating,
		reviewedAt: new Date(row.reviewedAt).toISOString(),
		previousStatus: row.previousStatus as ReviewEvent["previousStatus"],
		nextStatus: row.nextStatus as ReviewEvent["nextStatus"],
		previousIntervalMinutes: row.previousIntervalMinutes,
		nextIntervalMinutes: row.nextIntervalMinutes,
	};
}

function mapSummary(
	row: typeof reviewSessionSummaries.$inferSelect,
): ReviewSessionSummary {
	return {
		id: row.id,
		languageId: row.languageId,
		completedAt: new Date(row.completedAt).toISOString(),
		reviewedCount: row.reviewedCount,
		newlyLearnedCount: row.newlyLearnedCount,
		correctCount: row.correctCount,
		ratingBreakdown: {
			dontKnow: Number(row.ratingBreakdown?.dontKnow ?? 0),
			ok: Number(row.ratingBreakdown?.ok ?? 0),
			good: Number(row.ratingBreakdown?.good ?? 0),
			excellent: Number(row.ratingBreakdown?.excellent ?? 0),
		},
	};
}

function mapAppSettings(row: typeof appSettings.$inferSelect): AppSettings {
	return {
		onboardingCompleted: row.onboardingCompleted,
		activeLanguageId: row.activeLanguageId,
		nativeLanguageId: row.nativeLanguageId,
	};
}

function createAppSettingsRecord(settings: AppSettings) {
	const now = new Date();

	return {
		id: APP_SETTINGS_ROW_ID,
		onboardingCompleted: settings.onboardingCompleted,
		activeLanguageId: settings.activeLanguageId,
		nativeLanguageId: settings.nativeLanguageId,
		createdAt: now,
		updatedAt: now,
	};
}

async function getLatestSummary() {
	const db = getDb();
	const [summaryRow] = await db
		.select()
		.from(reviewSessionSummaries)
		.orderBy(desc(reviewSessionSummaries.completedAt))
		.limit(1);

	return summaryRow ? mapSummary(summaryRow) : null;
}

async function insertCards(cardsToInsert: Flashcard[]) {
	if (cardsToInsert.length === 0) {
		return;
	}

	const db = getDb();
	await db.insert(flashcards).values(
		cardsToInsert.map((card) => ({
			id: card.id,
			languageId: card.languageId,
			prompt: card.prompt,
			translation: card.translation,
			example: card.example,
			note: card.note,
			tags: card.tags,
			pronunciation: card.pronunciation,
			difficulty: card.difficulty,
			createdAt: new Date(card.createdAt),
			updatedAt: new Date(card.updatedAt),
			status: card.status,
			dueAt: new Date(card.dueAt),
			lastReviewedAt: card.lastReviewedAt
				? new Date(card.lastReviewedAt)
				: null,
			intervalMinutes: card.intervalMinutes,
			lastIntervalMinutes: card.lastIntervalMinutes,
			ease: card.ease,
			stepIndex: card.stepIndex,
			lapses: card.lapses,
			reviews: card.reviews,
			correctReviews: card.correctReviews,
			wrongReviews: card.wrongReviews,
			streak: card.streak,
		})),
	);
}

async function upsertSummary(summary: ReviewSessionSummary | null) {
	if (!summary) {
		return;
	}

	const db = getDb();
	await db
		.insert(reviewSessionSummaries)
		.values({
			id: summary.id,
			languageId: summary.languageId,
			completedAt: new Date(summary.completedAt),
			reviewedCount: summary.reviewedCount,
			newlyLearnedCount: summary.newlyLearnedCount,
			correctCount: summary.correctCount,
			ratingBreakdown: summary.ratingBreakdown,
		})
		.onConflictDoUpdate({
			target: reviewSessionSummaries.id,
			set: {
				languageId: summary.languageId,
				completedAt: new Date(summary.completedAt),
				reviewedCount: summary.reviewedCount,
				newlyLearnedCount: summary.newlyLearnedCount,
				correctCount: summary.correctCount,
				ratingBreakdown: summary.ratingBreakdown,
			},
		});
}

async function upsertAppSettingsRecord(settings: AppSettings) {
	const record = createAppSettingsRecord(settings);
	const db = getDb();

	await db
		.insert(appSettings)
		.values(record)
		.onConflictDoUpdate({
			target: appSettings.id,
			set: {
				onboardingCompleted: record.onboardingCompleted,
				activeLanguageId: record.activeLanguageId,
				nativeLanguageId: record.nativeLanguageId,
				updatedAt: record.updatedAt,
			},
		});
}

function createCardId() {
	return `card-${Math.random().toString(36).slice(2, 10)}`;
}

let appSettingsTableReady: Promise<void> | null = null;

async function ensureAppSettingsTable() {
	if (!appSettingsTableReady) {
		appSettingsTableReady = (async () => {
			const db = getDb();

			await db.execute(sql`
				CREATE TABLE IF NOT EXISTS "app_settings" (
					"id" text PRIMARY KEY NOT NULL,
					"onboarding_completed" boolean DEFAULT false NOT NULL,
					"active_language_id" text,
					"native_language_id" text NOT NULL,
					"created_at" timestamp with time zone NOT NULL,
					"updated_at" timestamp with time zone NOT NULL
				)
			`);
		})();
	}

	await appSettingsTableReady;
}

export async function getAppSettings(): Promise<AppSettings> {
	await ensureAppSettingsTable();

	const db = getDb();
	const [row] = await db
		.select()
		.from(appSettings)
		.where(eq(appSettings.id, APP_SETTINGS_ROW_ID))
		.limit(1);

	if (row) {
		return mapAppSettings(row);
	}

	const defaults = createDefaultAppSettings();
	await upsertAppSettingsRecord(defaults);
	return defaults;
}

export async function updateAppSettings(
	input: Partial<AppSettings>,
): Promise<AppSettings> {
	await ensureAppSettingsTable();

	const current = await getAppSettings();
	const next: AppSettings = {
		...current,
		...input,
	};

	await upsertAppSettingsRecord(next);
	return next;
}

export async function getAppDataSnapshot(): Promise<AppDataSnapshot> {
	const db = getDb();
	const [cardRows, reviewEventRows, lastSessionSummary] = await Promise.all([
		db.select().from(flashcards).orderBy(asc(flashcards.createdAt)),
		db.select().from(reviewEvents).orderBy(asc(reviewEvents.reviewedAt)),
		getLatestSummary(),
	]);

	return {
		cards: cardRows.map(mapFlashcard),
		reviewEvents: reviewEventRows.map(mapReviewEvent),
		lastSessionSummary,
	};
}

export async function addFlashcard(
	input: AddCardInput,
): Promise<
	| { ok: true; card: Flashcard }
	| { ok: false; reason: "duplicate"; duplicateCardId: string }
> {
	const db = getDb();
	const normalizedPrompt = normalizePromptStorage(
		input.languageId,
		input.prompt,
		input.pronunciation,
	);
	const normalizedExample = normalizeExampleStorage(
		input.languageId,
		input.example ?? "",
	);
	const existingCards = await db
		.select()
		.from(flashcards)
		.where(eq(flashcards.languageId, input.languageId));

	const duplicate = existingCards
		.map(mapFlashcard)
		.find(
			(card) =>
				getComparablePrompt(
					card.languageId,
					card.prompt,
					card.pronunciation,
				) ===
					getComparablePrompt(
						input.languageId,
						normalizedPrompt,
						input.pronunciation ?? "",
					) &&
				card.translation.trim().toLowerCase() ===
					input.translation.trim().toLowerCase(),
		);

	if (duplicate) {
		return {
			ok: false,
			reason: "duplicate",
			duplicateCardId: duplicate.id,
		};
	}

	const now = new Date().toISOString();
	const card: Flashcard = {
		id: createCardId(),
		languageId: input.languageId,
		prompt: normalizedPrompt,
		translation: input.translation.trim(),
		example: normalizedExample,
		note: input.note?.trim() ?? "",
		tags: input.tags ?? [],
		pronunciation: input.pronunciation?.trim() ?? "",
		difficulty: input.difficulty ?? "medium",
		createdAt: now,
		updatedAt: now,
		status: "new",
		dueAt: now,
		lastReviewedAt: null,
		intervalMinutes: 0,
		lastIntervalMinutes: 0,
		ease: 2.3,
		stepIndex: 0,
		lapses: 0,
		reviews: 0,
		correctReviews: 0,
		wrongReviews: 0,
		streak: 0,
	};

	await insertCards([card]);
	return { ok: true, card };
}

export async function reviewFlashcardById(
	cardId: string,
	rating: ReviewRating,
): Promise<ReviewResult | null> {
	const db = getDb();
	const [row] = await db
		.select()
		.from(flashcards)
		.where(eq(flashcards.id, cardId));

	if (!row) {
		return null;
	}

	const result = reviewFlashcard(mapFlashcard(row), rating);

	await db.transaction(async (tx) => {
		await tx
			.update(flashcards)
			.set({
				prompt: result.card.prompt,
				translation: result.card.translation,
				example: result.card.example,
				note: result.card.note,
				tags: result.card.tags,
				pronunciation: result.card.pronunciation,
				difficulty: result.card.difficulty,
				updatedAt: new Date(result.card.updatedAt),
				status: result.card.status,
				dueAt: new Date(result.card.dueAt),
				lastReviewedAt: result.card.lastReviewedAt
					? new Date(result.card.lastReviewedAt)
					: null,
				intervalMinutes: result.card.intervalMinutes,
				lastIntervalMinutes: result.card.lastIntervalMinutes,
				ease: result.card.ease,
				stepIndex: result.card.stepIndex,
				lapses: result.card.lapses,
				reviews: result.card.reviews,
				correctReviews: result.card.correctReviews,
				wrongReviews: result.card.wrongReviews,
				streak: result.card.streak,
			})
			.where(eq(flashcards.id, cardId));

		await tx.insert(reviewEvents).values({
			id: result.event.id,
			cardId: result.event.cardId,
			languageId: result.event.languageId,
			rating: result.event.rating,
			reviewedAt: new Date(result.event.reviewedAt),
			previousStatus: result.event.previousStatus,
			nextStatus: result.event.nextStatus,
			previousIntervalMinutes: result.event.previousIntervalMinutes,
			nextIntervalMinutes: result.event.nextIntervalMinutes,
		});
	});

	return result;
}

export async function saveReviewSessionSummary(summary: ReviewSessionSummary) {
	await upsertSummary(summary);
	return summary;
}

export async function ensureStarterDeck(
	input: CompleteOnboardingInput,
): Promise<AppDataSnapshot> {
	const db = getDb();
	const [existingCards] = await db
		.select({ count: sql<number>`count(*)` })
		.from(flashcards)
		.where(eq(flashcards.languageId, input.targetLanguageId));

	if (Number(existingCards?.count ?? 0) > 0) {
		return getAppDataSnapshot();
	}

	const starterDeck = buildStarterDeck(input);

	await db.transaction(async (tx) => {
		await tx.insert(flashcards).values(
			starterDeck.cards.map((card) => ({
				id: card.id,
				languageId: card.languageId,
				prompt: card.prompt,
				translation: card.translation,
				example: card.example,
				note: card.note,
				tags: card.tags,
				pronunciation: card.pronunciation,
				difficulty: card.difficulty,
				createdAt: new Date(card.createdAt),
				updatedAt: new Date(card.updatedAt),
				status: card.status,
				dueAt: new Date(card.dueAt),
				lastReviewedAt: card.lastReviewedAt
					? new Date(card.lastReviewedAt)
					: null,
				intervalMinutes: card.intervalMinutes,
				lastIntervalMinutes: card.lastIntervalMinutes,
				ease: card.ease,
				stepIndex: card.stepIndex,
				lapses: card.lapses,
				reviews: card.reviews,
				correctReviews: card.correctReviews,
				wrongReviews: card.wrongReviews,
				streak: card.streak,
			})),
		);
		await tx.insert(reviewEvents).values(
			starterDeck.reviewEvents.map((event) => ({
				id: event.id,
				cardId: event.cardId,
				languageId: event.languageId,
				rating: event.rating,
				reviewedAt: new Date(event.reviewedAt),
				previousStatus: event.previousStatus,
				nextStatus: event.nextStatus,
				previousIntervalMinutes: event.previousIntervalMinutes,
				nextIntervalMinutes: event.nextIntervalMinutes,
			})),
		);
		await tx.insert(reviewSessionSummaries).values({
			id: starterDeck.lastSessionSummary.id,
			languageId: starterDeck.lastSessionSummary.languageId,
			completedAt: new Date(starterDeck.lastSessionSummary.completedAt),
			reviewedCount: starterDeck.lastSessionSummary.reviewedCount,
			newlyLearnedCount: starterDeck.lastSessionSummary.newlyLearnedCount,
			correctCount: starterDeck.lastSessionSummary.correctCount,
			ratingBreakdown: starterDeck.lastSessionSummary.ratingBreakdown,
		});
	});

	return getAppDataSnapshot();
}

export async function resetFlashcardsApp() {
	await ensureAppSettingsTable();

	const defaults = createDefaultAppSettings();
	const db = getDb();

	await db.transaction(async (tx) => {
		await tx.delete(reviewSessionSummaries);
		await tx.delete(reviewEvents);
		await tx.delete(flashcards);
		await tx
			.insert(appSettings)
			.values(createAppSettingsRecord(defaults))
			.onConflictDoUpdate({
				target: appSettings.id,
				set: {
					onboardingCompleted: defaults.onboardingCompleted,
					activeLanguageId: defaults.activeLanguageId,
					nativeLanguageId: defaults.nativeLanguageId,
					updatedAt: new Date(),
				},
			});
	});

	return defaults;
}
