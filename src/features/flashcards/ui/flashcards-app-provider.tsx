import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
	normalizeExampleStorage,
	normalizePromptInput,
} from "#/features/flashcards/model/display";
import { getLanguageOption } from "#/features/flashcards/model/languages";
import { ensureLanguageProfile } from "#/features/flashcards/model/seed";
import {
	APP_STATE_STORAGE_KEY,
	APP_STATE_VERSION,
	createDefaultOnboardingDraft,
	createEmptyAppState,
	EMPTY_ADD_CARD_DRAFT,
	migrateAppState,
} from "#/features/flashcards/model/storage";
import type {
	AddCardDraft,
	AddCardInput,
	AppDataSnapshot,
	AppState,
	CompleteOnboardingInput,
	ReviewRating,
	ReviewResult,
	ReviewSessionSummary,
} from "#/features/flashcards/model/types";

type BootStatus = "booting" | "ready";

interface ActivateLanguageInput {
	languageId: string;
	includeStarterDeck?: boolean;
}

interface AddCardOptions {
	allowDuplicate?: boolean;
}

interface AddCardResult {
	ok: boolean;
	cardId?: string;
	reason?: "duplicate";
	duplicateCardId?: string;
}

interface FlashcardsAppStore extends AppState {
	hydrated: boolean;
	remoteLoaded: boolean;
	remoteLoading: boolean;
	setHydrated: (value: boolean) => void;
	loadRemoteState: () => Promise<void>;
	updateOnboardingDraft: (patch: Partial<AppState["onboardingDraft"]>) => void;
	completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
	activateLanguage: (input: ActivateLanguageInput) => Promise<void>;
	setNativeLanguage: (languageId: string) => void;
	updateAddCardDraft: (
		languageId: string,
		patch: Partial<AddCardDraft>,
	) => void;
	resetAddCardDraft: (languageId: string) => void;
	addCard: (
		input: AddCardInput,
		options?: AddCardOptions,
	) => Promise<AddCardResult>;
	reviewCard: (
		cardId: string,
		rating: ReviewRating,
	) => Promise<ReviewResult | null>;
	saveSessionSummary: (summary: ReviewSessionSummary) => Promise<void>;
	resetApp: () => Promise<void>;
}

const baseState = createEmptyAppState();

async function readJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed with status ${response.status}`);
	}

	return (await response.json()) as T;
}

function applyRemoteSnapshot(
	current: FlashcardsAppStore,
	snapshot: AppDataSnapshot,
) {
	return {
		...current,
		cards: snapshot.cards,
		reviewEvents: snapshot.reviewEvents,
		lastSessionSummary: snapshot.lastSessionSummary,
		remoteLoaded: true,
		remoteLoading: false,
	};
}

const persistedStorage = {
	getItem: (name: string) => {
		if (typeof window === "undefined") {
			return null;
		}

		const raw = window.localStorage.getItem(name);
		if (!raw) {
			return null;
		}

		try {
			const parsed = JSON.parse(raw);
			if (
				parsed &&
				typeof parsed === "object" &&
				"state" in parsed &&
				"version" in parsed
			) {
				return parsed;
			}

			return {
				state: migrateAppState(parsed),
				version: APP_STATE_VERSION,
			};
		} catch {
			return {
				state: createEmptyAppState(),
				version: APP_STATE_VERSION,
			};
		}
	},
	setItem: (name: string, value: unknown) => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(name, JSON.stringify(value));
	},
	removeItem: (name: string) => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.removeItem(name);
	},
};

export const useFlashcardsStore = create<FlashcardsAppStore>()(
	persist(
		(set, get) => ({
			...baseState,
			hydrated: false,
			remoteLoaded: false,
			remoteLoading: false,
			setHydrated: (value) => set({ hydrated: value }),
			loadRemoteState: async () => {
				const current = get();
				if (
					!current.hydrated ||
					current.remoteLoaded ||
					current.remoteLoading
				) {
					return;
				}

				set({ remoteLoading: true });

				try {
					let snapshot = await readJson<AppDataSnapshot>(
						await fetch("/api/app-state"),
					);

					if (
						snapshot.cards.length === 0 &&
						(current.cards.length > 0 ||
							current.reviewEvents.length > 0 ||
							current.lastSessionSummary)
					) {
						snapshot = await readJson<AppDataSnapshot>(
							await fetch("/api/app-state", {
								method: "POST",
								headers: {
									"content-type": "application/json",
								},
								body: JSON.stringify({
									cards: current.cards,
									reviewEvents: current.reviewEvents,
									lastSessionSummary: current.lastSessionSummary,
								} satisfies AppDataSnapshot),
							}),
						);
					}

					set((state) => applyRemoteSnapshot(state, snapshot));
				} catch (error) {
					console.error(
						"[flashcards-store] Failed to load remote state",
						error,
					);
					set({ remoteLoaded: true, remoteLoading: false });
				}
			},
			updateOnboardingDraft: (patch) =>
				set((current) => ({
					onboardingDraft: {
						...current.onboardingDraft,
						...patch,
					},
				})),
			completeOnboarding: async (input) => {
				set((current) => {
					const nextState = ensureLanguageProfile(
						current,
						input.targetLanguageId,
						input.nativeLanguageId,
					);

					return {
						...nextState,
						settings: {
							onboardingCompleted: true,
							activeLanguageId: input.targetLanguageId,
							nativeLanguageId: input.nativeLanguageId,
						},
						onboardingDraft: {
							...createDefaultOnboardingDraft(),
							targetLanguageId: input.targetLanguageId,
							nativeLanguageId: input.nativeLanguageId,
							startWithStarterDeck: input.startWithStarterDeck,
						},
					};
				});

				if (!input.startWithStarterDeck) {
					return;
				}

				try {
					const snapshot = await readJson<AppDataSnapshot>(
						await fetch("/api/starter-deck", {
							method: "POST",
							headers: {
								"content-type": "application/json",
							},
							body: JSON.stringify(input),
						}),
					);

					set((current) => ({
						...applyRemoteSnapshot(current, snapshot),
						languageProfiles: {
							...current.languageProfiles,
							[input.targetLanguageId]: {
								...(current.languageProfiles[input.targetLanguageId] ?? {
									languageId: input.targetLanguageId,
									nativeLanguageId: input.nativeLanguageId,
									createdAt: new Date().toISOString(),
									starterDeckLoaded: false,
								}),
								nativeLanguageId: input.nativeLanguageId,
								starterDeckLoaded: true,
							},
						},
					}));
				} catch (error) {
					console.error(
						"[flashcards-store] Failed to seed starter deck",
						error,
					);
				}
			},
			activateLanguage: async (input) => {
				set((current) => {
					const nativeLanguageId = current.settings.nativeLanguageId;
					const nextState = ensureLanguageProfile(
						current,
						input.languageId,
						nativeLanguageId,
					);

					return {
						...nextState,
						settings: {
							...nextState.settings,
							activeLanguageId: input.languageId,
							nativeLanguageId,
						},
					};
				});

				if (!input.includeStarterDeck) {
					return;
				}

				const nativeLanguageId = get().settings.nativeLanguageId;

				try {
					const snapshot = await readJson<AppDataSnapshot>(
						await fetch("/api/starter-deck", {
							method: "POST",
							headers: {
								"content-type": "application/json",
							},
							body: JSON.stringify({
								targetLanguageId: input.languageId,
								nativeLanguageId,
								startWithStarterDeck: true,
							} satisfies CompleteOnboardingInput),
						}),
					);

					set((current) => ({
						...applyRemoteSnapshot(current, snapshot),
						languageProfiles: {
							...current.languageProfiles,
							[input.languageId]: {
								...(current.languageProfiles[input.languageId] ?? {
									languageId: input.languageId,
									nativeLanguageId,
									createdAt: new Date().toISOString(),
									starterDeckLoaded: false,
								}),
								nativeLanguageId,
								starterDeckLoaded: true,
							},
						},
					}));
				} catch (error) {
					console.error(
						"[flashcards-store] Failed to seed starter deck",
						error,
					);
				}
			},
			setNativeLanguage: (languageId) =>
				set((current) => {
					const activeLanguageId = current.settings.activeLanguageId;
					return {
						settings: {
							...current.settings,
							nativeLanguageId: languageId,
						},
						onboardingDraft: {
							...current.onboardingDraft,
							nativeLanguageId: languageId,
						},
						languageProfiles: activeLanguageId
							? {
									...current.languageProfiles,
									[activeLanguageId]: current.languageProfiles[activeLanguageId]
										? {
												...current.languageProfiles[activeLanguageId],
												nativeLanguageId: languageId,
											}
										: current.languageProfiles[activeLanguageId],
								}
							: current.languageProfiles,
					};
				}),
			updateAddCardDraft: (languageId, patch) =>
				set((current) => ({
					addCardDrafts: {
						...current.addCardDrafts,
						[languageId]: {
							...(current.addCardDrafts[languageId] ?? EMPTY_ADD_CARD_DRAFT),
							...patch,
							...(typeof patch.prompt === "string"
								? { prompt: normalizePromptInput(languageId, patch.prompt) }
								: {}),
							...(typeof patch.example === "string"
								? {
										example: normalizeExampleStorage(languageId, patch.example),
									}
								: {}),
						},
					},
				})),
			resetAddCardDraft: (languageId) =>
				set((current) => ({
					addCardDrafts: {
						...current.addCardDrafts,
						[languageId]: EMPTY_ADD_CARD_DRAFT,
					},
				})),
			addCard: async (input) => {
				const response = await fetch("/api/cards", {
					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify(input),
				});

				const result = (await response.json()) as
					| { ok: true; card: AppState["cards"][number] }
					| { ok: false; reason: "duplicate"; duplicateCardId: string };

				if (!response.ok && result.ok !== false) {
					throw new Error("Could not save card.");
				}

				if (!result.ok) {
					return result;
				}

				set((state) => ({
					...ensureLanguageProfile(
						state,
						input.languageId,
						state.settings.nativeLanguageId,
					),
					cards: [...state.cards, result.card],
					addCardDrafts: {
						...state.addCardDrafts,
						[input.languageId]: EMPTY_ADD_CARD_DRAFT,
					},
				}));

				return {
					ok: true,
					cardId: result.card.id,
				};
			},
			reviewCard: async (cardId, rating) => {
				const result = await readJson<ReviewResult>(
					await fetch("/api/review-card", {
						method: "POST",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify({ cardId, rating }),
					}),
				);

				set((current) => ({
					cards: current.cards.map((card) =>
						card.id === cardId ? result.card : card,
					),
					reviewEvents: [...current.reviewEvents, result.event],
				}));

				return result;
			},
			saveSessionSummary: async (summary) => {
				await readJson<ReviewSessionSummary>(
					await fetch("/api/session-summary", {
						method: "POST",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify(summary),
					}),
				);

				set({ lastSessionSummary: summary });
			},
			resetApp: async () => {
				await readJson<{ ok: true }>(
					await fetch("/api/reset-app", {
						method: "POST",
					}),
				);

				set({
					...createEmptyAppState(),
					hydrated: true,
					remoteLoaded: true,
					remoteLoading: false,
				});
			},
		}),
		{
			name: APP_STATE_STORAGE_KEY,
			version: APP_STATE_VERSION,
			storage: persistedStorage,
			partialize: (state) => ({
				version: state.version,
				settings: state.settings,
				onboardingDraft: state.onboardingDraft,
				languageProfiles: state.languageProfiles,
				addCardDrafts: state.addCardDrafts,
			}),
			migrate: (persistedState) => migrateAppState(persistedState),
			onRehydrateStorage: () => (state) => {
				state?.setHydrated(true);
			},
		},
	),
);

export function useFlashcardsApp() {
	const version = useFlashcardsStore((store) => store.version);
	const settings = useFlashcardsStore((store) => store.settings);
	const onboardingDraft = useFlashcardsStore((store) => store.onboardingDraft);
	const languageProfiles = useFlashcardsStore(
		(store) => store.languageProfiles,
	);
	const cards = useFlashcardsStore((store) => store.cards);
	const reviewEvents = useFlashcardsStore((store) => store.reviewEvents);
	const addCardDrafts = useFlashcardsStore((store) => store.addCardDrafts);
	const lastSessionSummary = useFlashcardsStore(
		(store) => store.lastSessionSummary,
	);
	const hydrated = useFlashcardsStore((store) => store.hydrated);
	const remoteLoaded = useFlashcardsStore((store) => store.remoteLoaded);
	const remoteLoading = useFlashcardsStore((store) => store.remoteLoading);
	const loadRemoteState = useFlashcardsStore((store) => store.loadRemoteState);
	const updateOnboardingDraft = useFlashcardsStore(
		(store) => store.updateOnboardingDraft,
	);
	const completeOnboarding = useFlashcardsStore(
		(store) => store.completeOnboarding,
	);
	const activateLanguage = useFlashcardsStore(
		(store) => store.activateLanguage,
	);
	const updateAddCardDraft = useFlashcardsStore(
		(store) => store.updateAddCardDraft,
	);
	const setNativeLanguage = useFlashcardsStore(
		(store) => store.setNativeLanguage,
	);
	const resetAddCardDraft = useFlashcardsStore(
		(store) => store.resetAddCardDraft,
	);
	const addCard = useFlashcardsStore((store) => store.addCard);
	const reviewCard = useFlashcardsStore((store) => store.reviewCard);
	const saveSessionSummary = useFlashcardsStore(
		(store) => store.saveSessionSummary,
	);
	const resetApp = useFlashcardsStore((store) => store.resetApp);

	useEffect(() => {
		if (hydrated && !remoteLoaded && !remoteLoading) {
			void loadRemoteState();
		}
	}, [hydrated, loadRemoteState, remoteLoaded, remoteLoading]);

	const state = {
		version,
		settings,
		onboardingDraft,
		languageProfiles,
		cards,
		reviewEvents,
		addCardDrafts,
		lastSessionSummary,
	};

	return {
		state,
		bootStatus: (hydrated && remoteLoaded ? "ready" : "booting") as BootStatus,
		updateOnboardingDraft,
		completeOnboarding,
		activateLanguage,
		setNativeLanguage,
		updateAddCardDraft,
		resetAddCardDraft,
		addCard,
		reviewCard,
		saveSessionSummary,
		resetApp,
		activeLanguage: getLanguageOption(state.settings.activeLanguageId),
	};
}
