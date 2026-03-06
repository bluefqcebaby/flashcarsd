CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"translation" text NOT NULL,
	"example_one" text NOT NULL,
	"example_two" text NOT NULL,
	"target_language" text NOT NULL,
	"native_language" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
