import { DEFAULT_NATIVE_LANGUAGE_ID } from "#/features/flashcards/model/languages";
import type {
	AddCardDraft,
	AppState,
	OnboardingDraft,
} from "#/features/flashcards/model/types";

const STORAGE_KEY = "lumaloop-app-state";

export const APP_STATE_VERSION = 1;
export const APP_STATE_STORAGE_KEY = STORAGE_KEY;

export const EMPTY_ADD_CARD_DRAFT: AddCardDraft = {
	prompt: "",
	translation: "",
	example: "",
	note: "",
	tags: "",
	pronunciation: "",
	difficulty: "medium",
};

export function createDefaultOnboardingDraft(): OnboardingDraft {
	return {
		step: 0,
		targetLanguageId: null,
		nativeLanguageId: DEFAULT_NATIVE_LANGUAGE_ID,
		startWithStarterDeck: true,
	};
}

export function createEmptyAppState(): AppState {
	return {
		version: APP_STATE_VERSION,
		settings: {
			onboardingCompleted: false,
			activeLanguageId: null,
			nativeLanguageId: DEFAULT_NATIVE_LANGUAGE_ID,
		},
		onboardingDraft: createDefaultOnboardingDraft(),
		languageProfiles: {},
		cards: [],
		reviewEvents: [],
		addCardDrafts: {},
		lastSessionSummary: null,
	};
}

export function migrateAppState(input: unknown): AppState {
	if (!input || typeof input !== "object") {
		return createEmptyAppState();
	}

	const value = input as Partial<AppState>;
	const base = createEmptyAppState();

	return {
		...base,
		...value,
		version: APP_STATE_VERSION,
		settings: {
			...base.settings,
			...value.settings,
		},
		onboardingDraft: {
			...base.onboardingDraft,
			...value.onboardingDraft,
		},
		languageProfiles: value.languageProfiles ?? base.languageProfiles,
		cards: Array.isArray(value.cards) ? value.cards : base.cards,
		reviewEvents: Array.isArray(value.reviewEvents)
			? value.reviewEvents
			: base.reviewEvents,
		addCardDrafts: value.addCardDrafts ?? base.addCardDrafts,
		lastSessionSummary: value.lastSessionSummary ?? base.lastSessionSummary,
	};
}

export function loadAppState() {
	if (typeof window === "undefined") {
		return createEmptyAppState();
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return createEmptyAppState();
		}

		return migrateAppState(JSON.parse(raw));
	} catch {
		return createEmptyAppState();
	}
}

export function saveAppState(state: AppState) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppState() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(STORAGE_KEY);
}
