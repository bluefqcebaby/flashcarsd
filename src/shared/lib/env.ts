const defaultModel = "gpt-5-mini";
const defaultAuthBaseUrl = "http://localhost:1235";
const defaultAuthSecret = "dev-only-better-auth-secret-change-me";

export function getEnvVar(
	name:
		| "BETTER_AUTH_SECRET"
		| "BETTER_AUTH_URL"
		| "DATABASE_URL"
		| "GOOGLE_CLIENT_ID"
		| "GOOGLE_CLIENT_SECRET"
		| "OPENAI_API_KEY",
) {
	return process.env[name] ?? "";
}

export function getOpenAIModel() {
	return process.env.OPENAI_MODEL ?? defaultModel;
}

export function getBetterAuthBaseUrl() {
	return getEnvVar("BETTER_AUTH_URL") || defaultAuthBaseUrl;
}

export function getBetterAuthSecret() {
	return getEnvVar("BETTER_AUTH_SECRET") || defaultAuthSecret;
}

export function isGoogleOAuthConfigured() {
	return (
		getEnvVar("GOOGLE_CLIENT_ID").length > 0 &&
		getEnvVar("GOOGLE_CLIENT_SECRET").length > 0
	);
}

export function listMissingIntegrationEnvVars() {
	const required: Array<"DATABASE_URL" | "OPENAI_API_KEY"> = [
		"DATABASE_URL",
		"OPENAI_API_KEY",
	];

	return required.filter((name) => getEnvVar(name).length === 0);
}
