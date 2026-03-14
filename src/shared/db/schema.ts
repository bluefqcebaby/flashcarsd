import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	},
	(table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const flashcards = pgTable(
	"flashcards",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),
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
		index("flashcards_user_language_due_idx").on(
			table.userId,
			table.languageId,
			table.dueAt,
		),
	],
);

export const userSettings = pgTable("user_settings", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
	activeLanguageId: text("active_language_id"),
	nativeLanguageId: text("native_language_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const reviewEvents = pgTable(
	"review_events",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),
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
		index("review_events_user_language_reviewed_idx").on(
			table.userId,
			table.languageId,
			table.reviewedAt,
		),
	],
);

export const reviewSessionSummaries = pgTable(
	"review_session_summaries",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),
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
		index("review_session_summaries_user_completed_idx").on(
			table.userId,
			table.completedAt,
		),
	],
);
