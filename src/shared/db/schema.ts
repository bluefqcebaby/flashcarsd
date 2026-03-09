import { sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const flashcards = pgTable(
	"flashcards",
	{
		id: text("id").primaryKey(),
		languageId: text("language_id").notNull(),
		prompt: text("prompt").notNull(),
		translation: text("translation").notNull(),
		example: text("example").notNull().default(""),
		note: text("note").notNull().default(""),
		tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
		pronunciation: text("pronunciation").notNull().default(""),
		difficulty: text("difficulty").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
		status: text("status").notNull(),
		dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
		lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
		intervalMinutes: integer("interval_minutes").notNull().default(0),
		lastIntervalMinutes: integer("last_interval_minutes").notNull().default(0),
		ease: real("ease").notNull().default(2.3),
		stepIndex: integer("step_index").notNull().default(0),
		lapses: integer("lapses").notNull().default(0),
		reviews: integer("reviews").notNull().default(0),
		correctReviews: integer("correct_reviews").notNull().default(0),
		wrongReviews: integer("wrong_reviews").notNull().default(0),
		streak: integer("streak").notNull().default(0),
	},
	(table) => [
		index("flashcards_language_due_idx").on(table.languageId, table.dueAt),
	],
);

export const reviewEvents = pgTable(
	"review_events",
	{
		id: text("id").primaryKey(),
		cardId: text("card_id")
			.notNull()
			.references(() => flashcards.id, { onDelete: "cascade" }),
		languageId: text("language_id").notNull(),
		rating: text("rating").notNull(),
		reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull(),
		previousStatus: text("previous_status").notNull(),
		nextStatus: text("next_status").notNull(),
		previousIntervalMinutes: integer("previous_interval_minutes")
			.notNull()
			.default(0),
		nextIntervalMinutes: integer("next_interval_minutes").notNull().default(0),
	},
	(table) => [
		index("review_events_language_reviewed_idx").on(
			table.languageId,
			table.reviewedAt,
		),
	],
);

export const reviewSessionSummaries = pgTable(
	"review_session_summaries",
	{
		id: text("id").primaryKey(),
		languageId: text("language_id").notNull(),
		completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
		reviewedCount: integer("reviewed_count").notNull().default(0),
		newlyLearnedCount: integer("newly_learned_count").notNull().default(0),
		correctCount: integer("correct_count").notNull().default(0),
		ratingBreakdown: jsonb("rating_breakdown")
			.$type<Record<string, number>>()
			.notNull()
			.default(sql`'{}'::jsonb`),
	},
	(table) => [
		index("review_session_summaries_completed_idx").on(table.completedAt),
	],
);
