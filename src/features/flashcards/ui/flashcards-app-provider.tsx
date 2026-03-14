import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";

import {
	createDefaultAppSettings,
	createEmptyAppDataSnapshot,
} from "#/features/flashcards/model/app-state";
import { getLanguageOption } from "#/features/flashcards/model/languages";
import type {
	AddCardInput,
	AppDataSnapshot,
	AppSettings,
	CompleteOnboardingInput,
	ReviewRating,
	ReviewResult,
	ReviewSessionSummary,
} from "#/features/flashcards/model/types";
import { authClient } from "#/shared/lib/auth-client";

type BootStatus = "booting" | "ready";
type SessionShape = typeof authClient.$Infer.Session;

interface ActivateLanguageInput {
	languageId: string;
	includeStarterDeck?: boolean;
}

interface AddCardResult {
	ok: boolean;
	cardId?: string;
	reason?: "duplicate";
	duplicateCardId?: string;
}

interface FlashcardsSettingsContextValue {
	authStatus: BootStatus;
	session: SessionShape | null;
	settings: AppSettings;
	settingsStatus: BootStatus;
	signInWithGoogle: (callbackURL?: string) => Promise<void>;
	signOut: () => Promise<void>;
	completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
	activateLanguage: (input: ActivateLanguageInput) => Promise<void>;
	setNativeLanguage: (languageId: string) => Promise<void>;
	resetApp: () => Promise<void>;
}

const SETTINGS_QUERY_KEY = ["app-settings"] as const;
const APP_DATA_QUERY_KEY = ["app-data"] as const;

const SETTINGS_STALE_TIME = 30_000;
const APP_DATA_STALE_TIME = 10_000;

const FlashcardsSettingsContext =
	createContext<FlashcardsSettingsContextValue | null>(null);

function isClientRuntime() {
	return typeof window !== "undefined";
}

async function readJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed with status ${response.status}`);
	}

	return (await response.json()) as T;
}

async function fetchAppSettings() {
	return readJson<AppSettings>(await fetch("/api/settings"));
}

async function patchAppSettings(input: Partial<AppSettings>) {
	return readJson<AppSettings>(
		await fetch("/api/settings", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(input),
		}),
	);
}

async function fetchAppData() {
	return readJson<AppDataSnapshot>(await fetch("/api/app-state"));
}

async function ensureStarterDeck(input: CompleteOnboardingInput) {
	return readJson<AppDataSnapshot>(
		await fetch("/api/starter-deck", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(input),
		}),
	);
}

async function createCard(input: AddCardInput) {
	const response = await fetch("/api/cards", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify(input),
	});
	const result = (await response.json()) as
		| { ok: true; card: AppDataSnapshot["cards"][number] }
		| { ok: false; reason: "duplicate"; duplicateCardId: string };

	if (!response.ok && result.ok !== false) {
		throw new Error("Could not save card.");
	}

	return result;
}

async function submitCardReview(input: {
	cardId: string;
	rating: ReviewRating;
}) {
	return readJson<ReviewResult>(
		await fetch("/api/review-card", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(input),
		}),
	);
}

async function submitSessionSummary(summary: ReviewSessionSummary) {
	return readJson<ReviewSessionSummary>(
		await fetch("/api/session-summary", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(summary),
		}),
	);
}

async function resetFlashcardsApp() {
	return readJson<{ ok: true; settings: AppSettings }>(
		await fetch("/api/reset-app", {
			method: "POST",
		}),
	);
}

function FlashcardsSettingsProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const sessionQuery = authClient.useSession();
	const session = sessionQuery.data;
	const isAuthenticated = Boolean(session);
	const authStatus = sessionQuery.isPending ? "booting" : "ready";

	const settingsQuery = useQuery({
		queryKey: SETTINGS_QUERY_KEY,
		queryFn: fetchAppSettings,
		enabled: isClientRuntime() && authStatus === "ready" && isAuthenticated,
		staleTime: SETTINGS_STALE_TIME,
	});
	const updateSettingsMutation = useMutation({
		mutationFn: patchAppSettings,
		onSuccess: (settings) => {
			queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
		},
	});
	const starterDeckMutation = useMutation({
		mutationFn: ensureStarterDeck,
		onSuccess: (snapshot) => {
			queryClient.setQueryData(APP_DATA_QUERY_KEY, snapshot);
		},
	});
	const resetMutation = useMutation({
		mutationFn: resetFlashcardsApp,
		onSuccess: ({ settings }) => {
			queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
			queryClient.setQueryData(
				APP_DATA_QUERY_KEY,
				createEmptyAppDataSnapshot(),
			);
		},
	});

	if (settingsQuery.error) {
		throw settingsQuery.error;
	}

	const settings = isAuthenticated
		? (settingsQuery.data ?? createDefaultAppSettings())
		: createDefaultAppSettings();
	const settingsStatus =
		authStatus === "booting" ||
		(isAuthenticated && !settingsQuery.isSuccess && !settingsQuery.data)
			? "booting"
			: "ready";

	const value: FlashcardsSettingsContextValue = {
		authStatus,
		session,
		settings,
		settingsStatus,
		signInWithGoogle: async (callbackURL = "/") => {
			const result = await authClient.signIn.social({
				callbackURL,
				disableRedirect: true,
				provider: "google",
			});
			const redirectUrl = result.data?.url;

			if (!redirectUrl) {
				throw new Error("Could not start Google sign-in.");
			}

			window.location.assign(redirectUrl);
		},
		signOut: async () => {
			await authClient.signOut();
			queryClient.clear();
			await sessionQuery.refetch();
		},
		completeOnboarding: async (input) => {
			await updateSettingsMutation.mutateAsync({
				onboardingCompleted: true,
				activeLanguageId: input.targetLanguageId,
				nativeLanguageId: input.nativeLanguageId,
			});

			if (input.startWithStarterDeck) {
				await starterDeckMutation.mutateAsync(input);
			}
		},
		activateLanguage: async ({ languageId, includeStarterDeck }) => {
			await updateSettingsMutation.mutateAsync({
				activeLanguageId: languageId,
			});

			if (includeStarterDeck) {
				await starterDeckMutation.mutateAsync({
					targetLanguageId: languageId,
					nativeLanguageId: settings.nativeLanguageId,
					startWithStarterDeck: true,
				});
			}
		},
		setNativeLanguage: async (languageId) => {
			await updateSettingsMutation.mutateAsync({
				nativeLanguageId: languageId,
			});
		},
		resetApp: async () => {
			await resetMutation.mutateAsync();
		},
	};

	return (
		<FlashcardsSettingsContext.Provider value={value}>
			{children}
		</FlashcardsSettingsContext.Provider>
	);
}

export function FlashcardsAppProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: 1,
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<FlashcardsSettingsProvider>{children}</FlashcardsSettingsProvider>
		</QueryClientProvider>
	);
}

function useFlashcardsSettings() {
	const context = useContext(FlashcardsSettingsContext);

	if (!context) {
		throw new Error(
			"useFlashcardsApp must be used within FlashcardsAppProvider.",
		);
	}

	return context;
}

export function useFlashcardsAppSettings() {
	const {
		authStatus,
		session,
		settings,
		settingsStatus,
		signInWithGoogle,
		signOut,
		completeOnboarding,
		activateLanguage,
		setNativeLanguage,
		resetApp,
	} = useFlashcardsSettings();

	return {
		session,
		isAuthenticated: Boolean(session),
		authStatus,
		settings,
		bootStatus: settingsStatus,
		signInWithGoogle,
		signOut,
		completeOnboarding,
		activateLanguage,
		setNativeLanguage,
		resetApp,
		activeLanguage: getLanguageOption(settings.activeLanguageId),
	};
}

export function useFlashcardsApp() {
	const queryClient = useQueryClient();
	const {
		authStatus,
		session,
		settings,
		bootStatus,
		signInWithGoogle,
		signOut,
		completeOnboarding,
		activateLanguage,
		setNativeLanguage,
		resetApp,
		activeLanguage,
	} = useFlashcardsAppSettings();
	const isAuthenticated = Boolean(session);
	const appDataQuery = useQuery({
		queryKey: APP_DATA_QUERY_KEY,
		queryFn: fetchAppData,
		enabled: isClientRuntime() && authStatus === "ready" && isAuthenticated,
		staleTime: APP_DATA_STALE_TIME,
	});
	const addCardMutation = useMutation({
		mutationFn: createCard,
		onSuccess: (result) => {
			if (!result.ok) {
				return;
			}

			queryClient.setQueryData(
				APP_DATA_QUERY_KEY,
				(current: AppDataSnapshot | undefined) => {
					const snapshot = current ?? createEmptyAppDataSnapshot();
					return {
						...snapshot,
						cards: [...snapshot.cards, result.card],
					};
				},
			);
		},
	});
	const reviewCardMutation = useMutation({
		mutationFn: submitCardReview,
		onSuccess: (result, variables) => {
			queryClient.setQueryData(
				APP_DATA_QUERY_KEY,
				(current: AppDataSnapshot | undefined) => {
					const snapshot = current ?? createEmptyAppDataSnapshot();
					return {
						...snapshot,
						cards: snapshot.cards.map((card) =>
							card.id === variables.cardId ? result.card : card,
						),
						reviewEvents: [...snapshot.reviewEvents, result.event],
					};
				},
			);
		},
	});
	const sessionSummaryMutation = useMutation({
		mutationFn: submitSessionSummary,
		onSuccess: (summary) => {
			queryClient.setQueryData(
				APP_DATA_QUERY_KEY,
				(current: AppDataSnapshot | undefined) => ({
					...(current ?? createEmptyAppDataSnapshot()),
					lastSessionSummary: summary,
				}),
			);
		},
	});

	if (appDataQuery.error) {
		throw appDataQuery.error;
	}

	const snapshot = isAuthenticated
		? (appDataQuery.data ?? createEmptyAppDataSnapshot())
		: createEmptyAppDataSnapshot();
	const state = {
		settings,
		...snapshot,
	};

	return {
		state,
		session,
		isAuthenticated,
		authStatus,
		bootStatus:
			authStatus === "ready" &&
			(!isAuthenticated || (bootStatus === "ready" && appDataQuery.isSuccess))
				? ("ready" as BootStatus)
				: ("booting" as BootStatus),
		signInWithGoogle,
		signOut,
		completeOnboarding,
		activateLanguage,
		setNativeLanguage,
		addCard: async (input: AddCardInput): Promise<AddCardResult> => {
			const result = await addCardMutation.mutateAsync(input);

			if (!result.ok) {
				return result;
			}

			return {
				ok: true,
				cardId: result.card.id,
			};
		},
		reviewCard: async (cardId: string, rating: ReviewRating) =>
			reviewCardMutation.mutateAsync({ cardId, rating }),
		saveSessionSummary: async (summary: ReviewSessionSummary) => {
			await sessionSummaryMutation.mutateAsync(summary);
		},
		resetApp,
		activeLanguage,
	};
}
