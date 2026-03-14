import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "#/shared/db/client";
import * as schema from "#/shared/db/schema";
import {
	getBetterAuthBaseUrl,
	getBetterAuthSecret,
	getEnvVar,
	isGoogleOAuthConfigured,
} from "#/shared/lib/env";

const googleSocialProviders = isGoogleOAuthConfigured()
	? {
			google: {
				clientId: getEnvVar("GOOGLE_CLIENT_ID"),
				clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
			},
		}
	: undefined;

export const auth = betterAuth({
	baseURL: getBetterAuthBaseUrl(),
	database: drizzleAdapter(getDb(), {
		provider: "pg",
		schema,
	}),
	plugins: [tanstackStartCookies()],
	secret: getBetterAuthSecret(),
	socialProviders: googleSocialProviders,
	trustedOrigins: [getBetterAuthBaseUrl()],
});

export async function getAuthSession(request: Request) {
	return auth.api.getSession({
		headers: request.headers,
	});
}

export async function requireAuthenticatedUser(request: Request) {
	const session = await getAuthSession(request);

	if (!session) {
		return null;
	}

	return session.user;
}

export async function requireAuthenticatedUserId(request: Request) {
	const user = await requireAuthenticatedUser(request);
	return user?.id ?? null;
}
