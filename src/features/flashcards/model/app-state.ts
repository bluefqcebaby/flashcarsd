import { DEFAULT_NATIVE_LANGUAGE_ID } from "#/features/flashcards/model/languages";
import type { AppDataSnapshot, AppSettings } from "#/features/flashcards/model/types";

export const APP_SETTINGS_ROW_ID = "default";

export function createDefaultAppSettings(): AppSettings {
	return {
		onboardingCompleted: false,
		activeLanguageId: null,
		nativeLanguageId: DEFAULT_NATIVE_LANGUAGE_ID,
	};
}

export function createEmptyAppDataSnapshot(): AppDataSnapshot {
	return {
		cards: [],
		reviewEvents: [],
		lastSessionSummary: null,
	};
}
