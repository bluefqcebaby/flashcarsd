import { sql } from "drizzle-orm";
import OpenAI from "openai";
import { getDb } from "#/shared/db/client";
import {
	getEnvVar,
	getOpenAIModel,
	listMissingIntegrationEnvVars,
} from "./env";

type IntegrationCheckResult = {
	ok: boolean;
	durationMs: number;
	details: string;
	error?: string;
};

export type IntegrationReport = {
	ok: boolean;
	checkedAt: string;
	openaiModel: string;
	missingEnvVars: string[];
	checks: {
		databaseConnection: IntegrationCheckResult;
		flashcardsTable: IntegrationCheckResult;
		openai: IntegrationCheckResult;
	};
};

async function runCheck(check: () => Promise<string>): Promise<{
	ok: boolean;
	durationMs: number;
	details: string;
	error?: string;
}> {
	const startedAt = Date.now();

	try {
		const details = await check();
		return {
			ok: true,
			durationMs: Date.now() - startedAt,
			details,
		};
	} catch (error) {
		return {
			ok: false,
			durationMs: Date.now() - startedAt,
			details: "Failed",
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export async function runIntegrationCheck(): Promise<IntegrationReport> {
	const missingEnvVars = listMissingIntegrationEnvVars();
	const openaiModel = getOpenAIModel();

	if (missingEnvVars.length > 0) {
		return {
			ok: false,
			checkedAt: new Date().toISOString(),
			openaiModel,
			missingEnvVars,
			checks: {
				databaseConnection: {
					ok: false,
					durationMs: 0,
					details: "Skipped",
					error: "Missing required environment variables.",
				},
				flashcardsTable: {
					ok: false,
					durationMs: 0,
					details: "Skipped",
					error: "Missing required environment variables.",
				},
				openai: {
					ok: false,
					durationMs: 0,
					details: "Skipped",
					error: "Missing required environment variables.",
				},
			},
		};
	}

	const databaseConnection = await runCheck(async () => {
		const db = getDb();
		await db.execute(sql`select 1`);
		return "Connected via Drizzle to Postgres";
	});

	const flashcardsTable = await runCheck(async () => {
		const db = getDb();
		const tableCheck = await db.execute<{ exists: boolean }>(sql`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'flashcards'
      ) as exists
    `);

		if (!tableCheck.rows[0]?.exists) {
			throw new Error(
				'Table "flashcards" does not exist. Run bun run db:migrate.',
			);
		}

		return "flashcards table exists";
	});

	const openai = await runCheck(async () => {
		const client = new OpenAI({
			apiKey: getEnvVar("OPENAI_API_KEY"),
		});

		const response = await client.responses.create({
			model: openaiModel,
			input: "Reply with exactly: OK",
			max_output_tokens: 16,
		});

		const text = response.output_text.trim();
		if (text.length > 0) {
			return `OpenAI call succeeded with output: "${text}"`;
		}

		if (!response.id) {
			throw new Error("OpenAI returned a response without an id.");
		}

		return `OpenAI call succeeded (response id: ${response.id}, empty text output)`;
	});

	const ok = databaseConnection.ok && flashcardsTable.ok && openai.ok;

	return {
		ok,
		checkedAt: new Date().toISOString(),
		openaiModel,
		missingEnvVars,
		checks: {
			databaseConnection,
			flashcardsTable,
			openai,
		},
	};
}
