import { createAuthClient } from "better-auth/react";

function getAuthClientBaseUrl() {
	if (typeof window !== "undefined") {
		return new URL("/api/auth", window.location.origin).toString();
	}

	return new URL(
		"/api/auth",
		process.env.BETTER_AUTH_URL ?? "http://localhost:1235",
	).toString();
}

export const authClient = createAuthClient({
	baseURL: getAuthClientBaseUrl(),
});
