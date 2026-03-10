CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"active_language_id" text,
	"native_language_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);

INSERT INTO "app_settings" (
	"id",
	"onboarding_completed",
	"active_language_id",
	"native_language_id",
	"created_at",
	"updated_at"
)
VALUES (
	'default',
	false,
	NULL,
	'english',
	now(),
	now()
)
ON CONFLICT ("id") DO NOTHING;
