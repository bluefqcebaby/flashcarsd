export type DifficultyLevel = "easy" | "medium" | "hard";

export type ReviewStatus = "new" | "learning" | "review" | "relearning";

export type ReviewRating = "dontKnow" | "ok" | "good" | "excellent";

export interface LanguagePalette {
	primary: string;
	secondary: string;
	accent: string;
	glow: string;
}

export interface LanguageOption {
	id: string;
	label: string;
	nativeLabel: string;
	emoji: string;
	description: string;
	promptLabel: string;
	promptPlaceholder: string;
	translationLabel: string;
	translationPlaceholder: string;
	examplePlaceholder: string;
	notePlaceholder: string;
	pronunciationLabel: string;
	pronunciationPlaceholder: string;
	starterNudge: string;
	palette: LanguagePalette;
}

export interface Flashcard {
	id: string;
	languageId: string;
	prompt: string;
	translation: string;
	example: string;
	note: string;
	tags: string[];
	pronunciation: string;
	difficulty: DifficultyLevel;
	createdAt: string;
	updatedAt: string;
	status: ReviewStatus;
	dueAt: string;
	lastReviewedAt: string | null;
	intervalMinutes: number;
	lastIntervalMinutes: number;
	ease: number;
	stepIndex: number;
	lapses: number;
	reviews: number;
	correctReviews: number;
	wrongReviews: number;
	streak: number;
}

export interface ReviewEvent {
	id: string;
	cardId: string;
	languageId: string;
	rating: ReviewRating;
	reviewedAt: string;
	previousStatus: ReviewStatus;
	nextStatus: ReviewStatus;
	previousIntervalMinutes: number;
	nextIntervalMinutes: number;
}

export interface ReviewSessionSummary {
	id: string;
	languageId: string;
	completedAt: string;
	reviewedCount: number;
	newlyLearnedCount: number;
	correctCount: number;
	ratingBreakdown: Record<ReviewRating, number>;
}

export interface AppSettings {
	onboardingCompleted: boolean;
	activeLanguageId: string | null;
	nativeLanguageId: string;
}

export interface AppDataSnapshot {
	cards: Flashcard[];
	reviewEvents: ReviewEvent[];
	lastSessionSummary: ReviewSessionSummary | null;
}

export interface AppState extends AppDataSnapshot {
	settings: AppSettings;
}

export interface AddCardInput {
	languageId: string;
	prompt: string;
	translation: string;
	example?: string;
	note?: string;
	tags?: string[];
	pronunciation?: string;
	difficulty?: DifficultyLevel;
}

export interface CardAssistSuggestion {
	translation: string;
	example: string;
	note: string;
	tags: string[];
	pronunciation: string;
	difficulty: DifficultyLevel;
	source: "openai" | "local";
}

export interface CompleteOnboardingInput {
	targetLanguageId: string;
	nativeLanguageId: string;
	startWithStarterDeck: boolean;
}

export interface ReviewResult {
	card: Flashcard;
	event: ReviewEvent;
}

export interface IntervalPreview {
	rating: ReviewRating;
	label: string;
	minutes: number;
}
