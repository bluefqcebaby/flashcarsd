import { AlertCircle, Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button, ButtonLink } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Surface } from "#/components/ui/surface";
import {
	getComparablePrompt,
	getExampleDisplay,
	getPromptDisplay,
	normalizeExampleStorage,
	normalizePromptInput,
} from "#/features/flashcards/model/display";
import type { CardAssistSuggestion } from "#/features/flashcards/model/types";
import { AppShell } from "#/features/flashcards/ui/app-shell";
import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";
import { cn } from "#/shared/lib/cn";

const EMPTY_DRAFT = {
	prompt: "",
	translation: "",
	example: "",
	note: "",
	tags: "",
	pronunciation: "",
	difficulty: "medium" as const,
};

function parseTags(value: string) {
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

export function AddCardPage() {
	const { activeLanguage, state, addCard } = useFlashcardsApp();
	const [draft, setDraft] = useState(EMPTY_DRAFT);
	const [isGenerating, setIsGenerating] = useState(false);
	const [sessionAddedCount, setSessionAddedCount] = useState(0);
	const [status, setStatus] = useState<{
		type: "success" | "duplicate" | "error";
		message: string;
	} | null>(null);
	const [generationNote, setGenerationNote] = useState<string | null>(null);
	const tags = useMemo(() => parseTags(draft.tags), [draft.tags]);
	const duplicateCard = useMemo(() => {
		if (!activeLanguage || !draft.prompt.trim()) {
			return null;
		}

		return state.cards.find(
			(card) =>
				card.languageId === activeLanguage.id &&
				getComparablePrompt(
					card.languageId,
					card.prompt,
					card.pronunciation,
				) ===
					getComparablePrompt(
						activeLanguage.id,
						draft.prompt,
						draft.pronunciation,
					),
		);
	}, [activeLanguage, draft.prompt, draft.pronunciation, state.cards]);
	const hasGeneratedDraft =
		draft.prompt.trim().length > 0 && draft.translation.trim().length > 0;

	useEffect(() => {
		if (!activeLanguage?.id) {
			return;
		}

		setDraft(EMPTY_DRAFT);
		setStatus(null);
		setGenerationNote(null);
	}, [activeLanguage?.id]);

	if (!activeLanguage) {
		return null;
	}

	const updateDraft = (patch: Partial<typeof draft>) => {
		setDraft((current) => ({
			...current,
			...patch,
			...(typeof patch.prompt === "string"
				? { prompt: normalizePromptInput(activeLanguage.id, patch.prompt) }
				: {}),
			...(typeof patch.example === "string"
				? {
						example: normalizeExampleStorage(activeLanguage.id, patch.example),
					}
				: {}),
		}));
	};

	const generateDraft = async () => {
		if (!draft.prompt.trim()) {
			setStatus({
				type: "error",
				message: `Enter a ${activeLanguage.label.toLowerCase()} word or phrase first.`,
			});
			return;
		}

		setStatus(null);
		setGenerationNote(null);
		setIsGenerating(true);

		try {
			const response = await fetch("/api/generate-card", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					languageId: activeLanguage.id,
					prompt: draft.prompt,
				}),
			});

			if (!response.ok) {
				throw new Error("Could not generate a card right now.");
			}

			const suggestion = (await response.json()) as CardAssistSuggestion;
			updateDraft({
				prompt: normalizePromptInput(activeLanguage.id, draft.prompt),
				translation: suggestion.translation,
				pronunciation: suggestion.pronunciation,
				example: normalizeExampleStorage(activeLanguage.id, suggestion.example),
				note: suggestion.note,
				tags: suggestion.tags.join(", "),
				difficulty: suggestion.difficulty,
			});
			setGenerationNote(
				suggestion.source === "openai"
					? "AI generated the card details."
					: "Local fallback generated the card details. Check nuance before saving.",
			);
		} catch (error) {
			setStatus({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "Could not generate a card right now.",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const submit = async () => {
		if (!draft.prompt.trim() || !draft.translation.trim()) {
			setStatus({
				type: "error",
				message: "Generate the card first.",
			});
			return;
		}

		if (duplicateCard) {
			setStatus({
				type: "duplicate",
				message: `"${draft.prompt.trim()}" already exists in this deck.`,
			});
			return;
		}

		try {
			const result = await addCard({
				languageId: activeLanguage.id,
				prompt: draft.prompt,
				translation: draft.translation,
				pronunciation: draft.pronunciation,
				example: draft.example,
				note: draft.note,
				tags,
				difficulty: draft.difficulty,
			});

			if (!result.ok) {
				setStatus({
					type: "duplicate",
					message: `"${draft.prompt.trim()}" already exists in this deck.`,
				});
				return;
			}

			setDraft(EMPTY_DRAFT);
			setGenerationNote(null);
			setSessionAddedCount((count) => count + 1);
			setStatus({
				type: "success",
				message: `Card added! (${sessionAddedCount + 1} total this session)`,
			});
		} catch (error) {
			setStatus({
				type: "error",
				message:
					error instanceof Error ? error.message : "Could not save the card.",
			});
		}
	};

	const resetGeneratedDraft = () => {
		updateDraft({
			translation: "",
			pronunciation: "",
			example: "",
			note: "",
			tags: "",
			difficulty: "medium",
		});
		setGenerationNote(null);
		setStatus(null);
	};

	return (
		<AppShell width="form">
			<div className="space-y-5">
				<header>
					<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
						<span className="text-lg">{activeLanguage.emoji}</span>
						{activeLanguage.label}
					</p>
					<h1
						className="mt-3 text-3xl font-bold text-[var(--text-primary)]"
						style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
					>
						Add new card
					</h1>
				</header>

				{status ? (
					<Surface
						className={cn(
							"animate-scale-in flex items-center gap-3 px-4 py-4",
							status.type === "success" &&
								"border-[rgba(110,231,183,0.24)] bg-[rgba(110,231,183,0.1)] text-[var(--accent-mint)]",
							status.type === "duplicate" &&
								"border-[rgba(252,165,165,0.24)] bg-[rgba(252,165,165,0.1)] text-[var(--accent-coral)]",
							status.type === "error" &&
								"border-[rgba(252,165,165,0.24)] bg-[rgba(252,165,165,0.1)] text-[var(--accent-coral)]",
						)}
					>
						{status.type === "success" ? (
							<Check size={18} />
						) : (
							<AlertCircle size={18} />
						)}
						<p className="text-sm font-medium">{status.message}</p>
					</Surface>
				) : null}

				<Surface className="space-y-5 px-5 py-5">
					<div className="space-y-2">
						<label
							htmlFor="prompt"
							className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							{activeLanguage.promptLabel}
						</label>
						<div className="flex flex-col gap-3 sm:flex-row">
							<Input
								id="prompt"
								maxLength={200}
								value={draft.prompt}
								onChange={(event) => {
									updateDraft({
										prompt: normalizePromptInput(
											activeLanguage.id,
											event.target.value,
										),
									});
									if (hasGeneratedDraft) {
										resetGeneratedDraft();
									}
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										void generateDraft();
									}
								}}
								placeholder={activeLanguage.promptPlaceholder}
								className={cn(
									"min-h-14 flex-1 text-lg font-medium",
									duplicateCard &&
										"border-[rgba(252,165,165,0.4)] focus-visible:border-[var(--accent-coral)] focus-visible:ring-[rgba(252,165,165,0.12)]",
								)}
							/>
							<Button
								type="button"
								size="lg"
								className="min-w-36"
								onClick={generateDraft}
								disabled={isGenerating}
							>
								{isGenerating ? (
									"Generating"
								) : (
									<>
										<Sparkles size={18} />
										Add card
									</>
								)}
							</Button>
						</div>
						<p className="text-sm text-[var(--text-secondary)]">
							Type a word or phrase and let AI build the card for you.
						</p>
					</div>

					{hasGeneratedDraft ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm text-[var(--text-secondary)]">
									This is the card you&apos;ll see during review.
								</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={generateDraft}
									disabled={isGenerating}
								>
									Generate again
								</Button>
							</div>

							<div className="grid gap-4">
								<Surface className="overflow-hidden px-0 py-0">
									<div className="bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface),var(--bg-elevated))] px-5 py-6">
										<p className="mb-3 text-right text-xs text-[var(--text-tertiary)]">
											{activeLanguage.emoji}
										</p>
										<p
											className="text-center text-3xl font-bold text-[var(--text-primary)]"
											style={{
												fontFamily: "var(--font-display)",
												fontWeight: 700,
											}}
										>
											{getPromptDisplay(
												activeLanguage.id,
												draft.prompt,
												draft.pronunciation,
											)}
										</p>
										{draft.pronunciation ? (
											<p className="mt-3 text-center text-sm italic text-[var(--text-tertiary)]">
												/{draft.pronunciation}/
											</p>
										) : null}
									</div>
									<div className="border-t border-[color:var(--border-subtle)] bg-[linear-gradient(165deg,#1a1832,var(--bg-surface),#18202e)] px-5 py-6">
										<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
											Answer
										</p>
										<p
											className="mt-3 text-2xl font-bold text-[var(--text-primary)]"
											style={{
												fontFamily: "var(--font-display)",
												fontWeight: 700,
											}}
										>
											{draft.translation}
										</p>
										{draft.example ? (
											<p className="mt-4 text-sm italic text-[var(--text-secondary)]">
												“{getExampleDisplay(activeLanguage.id, draft.example)}”
											</p>
										) : null}
										{draft.note ? (
											<p className="mt-3 text-sm text-[var(--accent-lavender)]">
												{draft.note}
											</p>
										) : null}
										{tags.length > 0 ? (
											<div className="mt-4 flex flex-wrap gap-2">
												{tags.map((tag) => (
													<span
														key={tag}
														className="rounded-full border border-[rgba(245,183,49,0.18)] bg-[var(--accent-gold-dim)] px-3 py-1 text-[11px] font-medium text-[var(--accent-gold)]"
													>
														{tag}
													</span>
												))}
											</div>
										) : null}
									</div>
								</Surface>

								<div className="flex flex-col gap-3 sm:flex-row">
									<Button
										size="lg"
										className="flex-1"
										onClick={() => void submit()}
									>
										Save
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="lg"
										className="flex-1"
										onClick={resetGeneratedDraft}
									>
										Clear result
									</Button>
									{sessionAddedCount > 0 ? (
										<ButtonLink
											to="/review"
											variant="ghost"
											size="lg"
											className="flex-1"
										>
											Review
										</ButtonLink>
									) : null}
								</div>

								{generationNote ? (
									<p className="text-sm text-[var(--text-secondary)]">
										{generationNote}
									</p>
								) : null}
							</div>
						</div>
					) : null}
				</Surface>
			</div>
		</AppShell>
	);
}
