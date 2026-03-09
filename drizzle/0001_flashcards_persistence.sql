DROP TABLE IF EXISTS "review_events" CASCADE;
DROP TABLE IF EXISTS "review_session_summaries" CASCADE;
DROP TABLE IF EXISTS "flashcards" CASCADE;

CREATE TABLE "flashcards" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"prompt" text NOT NULL,
	"translation" text NOT NULL,
	"example" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pronunciation" text DEFAULT '' NOT NULL,
	"difficulty" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"interval_minutes" integer DEFAULT 0 NOT NULL,
	"last_interval_minutes" integer DEFAULT 0 NOT NULL,
	"ease" real DEFAULT 2.3 NOT NULL,
	"step_index" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"correct_reviews" integer DEFAULT 0 NOT NULL,
	"wrong_reviews" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "review_events" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"language_id" text NOT NULL,
	"rating" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"previous_status" text NOT NULL,
	"next_status" text NOT NULL,
	"previous_interval_minutes" integer DEFAULT 0 NOT NULL,
	"next_interval_minutes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "review_events_card_id_flashcards_id_fk"
		FOREIGN KEY ("card_id") REFERENCES "public"."flashcards"("id")
		ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "review_session_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"reviewed_count" integer DEFAULT 0 NOT NULL,
	"newly_learned_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"rating_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX "flashcards_language_due_idx"
	ON "flashcards" USING btree ("language_id","due_at");
CREATE INDEX "review_events_language_reviewed_idx"
	ON "review_events" USING btree ("language_id","reviewed_at");
CREATE INDEX "review_session_summaries_completed_idx"
	ON "review_session_summaries" USING btree ("completed_at");
