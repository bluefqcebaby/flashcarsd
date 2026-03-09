import { ArrowLeft, Flame, Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ButtonLink } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import {
	getExampleDisplay,
	getPromptDisplay,
} from "#/features/flashcards/model/display";
import { formatIntervalMinutes } from "#/features/flashcards/model/format";
import {
	buildStudyQueue,
	getCardsForLanguage,
	getDashboardSnapshot,
} from "#/features/flashcards/model/selectors";
import { getSchedulingPreviews } from "#/features/flashcards/model/srs";
import type {
	Flashcard,
	ReviewRating,
} from "#/features/flashcards/model/types";
import { AppShell } from "#/features/flashcards/ui/app-shell";
import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";
import { cn } from "#/shared/lib/cn";

interface SessionResult {
	cardId: string;
	rating: ReviewRating;
	graduated: boolean;
}

interface ReviewSessionState {
	queueIds: string[];
	results: SessionResult[];
	completedAt: string | null;
}

const RATING_META: Array<{
	rating: ReviewRating;
	label: string;
	color: string;
	glow: string;
	key: string;
}> = [
	{
		rating: "dontKnow",
		label: "Again",
		color: "#f87171",
		glow: "rgba(248,113,113,0.2)",
		key: "1",
	},
	{
		rating: "ok",
		label: "Hard",
		color: "#fb923c",
		glow: "rgba(251,146,60,0.2)",
		key: "2",
	},
	{
		rating: "good",
		label: "Good",
		color: "#34d399",
		glow: "rgba(52,211,153,0.2)",
		key: "3",
	},
	{
		rating: "excellent",
		label: "Easy",
		color: "#60a5fa",
		glow: "rgba(96,165,250,0.2)",
		key: "4",
	},
] as const;

function wait(ms: number) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createSession(queueIds: string[]): ReviewSessionState {
	return {
		queueIds,
		results: [],
		completedAt: null,
	};
}

function shouldReinsert(card: Flashcard, rating: ReviewRating) {
	if (rating === "dontKnow") {
		return true;
	}

	return (
		rating === "ok" &&
		(card.status === "learning" || card.status === "relearning")
	);
}

function buildStatusPill(card: Flashcard) {
	if (card.status === "new") {
		return {
			label: "NEW CARD",
			className: "bg-[rgba(167,139,250,0.14)] text-[var(--accent-lavender)]",
		};
	}

	if (card.status === "learning") {
		return {
			label: "LEARNING",
			className: "bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]",
		};
	}

	if (card.status === "relearning") {
		return {
			label: "RELEARNING",
			className: "bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]",
		};
	}

	return {
		label: `REVIEW (${formatIntervalMinutes(card.intervalMinutes)})`,
		className: "bg-[rgba(110,231,183,0.14)] text-[var(--accent-mint)]",
	};
}

export function ReviewPage() {
	const { activeLanguage, state, reviewCard, saveSessionSummary } =
		useFlashcardsApp();
	const [session, setSession] = useState<ReviewSessionState | null>(null);
	const [flipped, setFlipped] = useState(false);
	const [animClass, setAnimClass] = useState("animate-slide-in");
	const [cardKey, setCardKey] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [savedSummaryId, setSavedSummaryId] = useState<string | null>(null);

	const cards = getCardsForLanguage(state, activeLanguage?.id ?? null);
	const dueQueue = buildStudyQueue(cards, Date.now(), "due");
	const dueQueueIds = useMemo(
		() => dueQueue.map((card) => card.id),
		[dueQueue],
	);
	const dashboard = getDashboardSnapshot(state);

	useEffect(() => {
		setSession(dueQueueIds.length > 0 ? createSession(dueQueueIds) : null);
		setFlipped(false);
		setAnimClass("animate-slide-in");
		setCardKey(0);
		setSavedSummaryId(null);
	}, [dueQueueIds]);

	useEffect(() => {
		if (!session && dueQueue.length > 0) {
			setSession(createSession(dueQueueIds));
		}
	}, [dueQueue.length, dueQueueIds, session]);

	const currentCardId = session?.queueIds[0] ?? null;
	const currentCard = cards.find((card) => card.id === currentCardId) ?? null;
	const totalCount = session
		? session.queueIds.length + session.results.length
		: 0;
	const currentIndex =
		session && totalCount > 0 ? session.results.length + 1 : 0;
	const progress =
		totalCount > 0 ? (session?.results.length ?? 0) / totalCount : 0;
	const previews = useMemo(() => {
		if (!currentCard) {
			return new Map<ReviewRating, string>();
		}

		return new Map(
			getSchedulingPreviews(currentCard).map((preview) => [
				preview.rating,
				preview.label,
			]),
		);
	}, [currentCard]);

	useEffect(() => {
		if (!session?.completedAt || !activeLanguage) {
			return;
		}

		const summaryId = `summary-${activeLanguage.id}-${session.completedAt}`;
		if (savedSummaryId === summaryId) {
			return;
		}

		const ratingBreakdown = session.results.reduce<
			Record<ReviewRating, number>
		>(
			(accumulator, item) => {
				accumulator[item.rating] += 1;
				return accumulator;
			},
			{
				dontKnow: 0,
				ok: 0,
				good: 0,
				excellent: 0,
			},
		);

		void saveSessionSummary({
			id: summaryId,
			languageId: activeLanguage.id,
			completedAt: session.completedAt,
			reviewedCount: session.results.length,
			newlyLearnedCount: session.results.filter((item) => item.graduated)
				.length,
			correctCount: session.results.filter((item) => item.rating !== "dontKnow")
				.length,
			ratingBreakdown,
		});
		setSavedSummaryId(summaryId);
	}, [activeLanguage, saveSessionSummary, savedSummaryId, session]);

	const submitRating = useCallback(
		async (rating: ReviewRating) => {
			if (!currentCard || !session || isSubmitting) {
				return;
			}

			const exitAnimation =
				rating === "dontKnow"
					? "animate-slide-out-left"
					: "animate-slide-out-right";
			const graduated =
				(currentCard.status === "new" ||
					currentCard.status === "learning" ||
					currentCard.status === "relearning") &&
				(rating === "good" || rating === "excellent");

			setIsSubmitting(true);

			if (!flipped) {
				setFlipped(true);
				await wait(400);
			}

			setAnimClass(exitAnimation);
			await wait(350);

			await reviewCard(currentCard.id, rating);
			setSession((current) => {
				if (!current) {
					return current;
				}

				const [cardId, ...rest] = current.queueIds;
				const nextQueue = [...rest];

				if (cardId && shouldReinsert(currentCard, rating)) {
					nextQueue.splice(Math.min(4, nextQueue.length), 0, cardId);
				}

				return {
					queueIds: nextQueue,
					results: [
						...current.results,
						{
							cardId: currentCard.id,
							rating,
							graduated,
						},
					],
					completedAt: nextQueue.length === 0 ? new Date().toISOString() : null,
				};
			});

			setFlipped(false);
			setCardKey((value) => value + 1);
			setAnimClass("animate-slide-in");
			setIsSubmitting(false);
		},
		[currentCard, flipped, isSubmitting, reviewCard, session],
	);

	useEffect(() => {
		if (!currentCard || !session || session.completedAt) {
			return;
		}

		const handler = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement
			) {
				return;
			}

			if ((event.key === " " || event.key === "Enter") && !isSubmitting) {
				event.preventDefault();
				setFlipped((value) => !value);
				return;
			}

			const rating = RATING_META.find((item) => item.key === event.key)?.rating;
			if (rating && !isSubmitting) {
				event.preventDefault();
				void submitRating(rating);
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [currentCard, isSubmitting, session, submitRating]);

	if (!activeLanguage) {
		return null;
	}

	if (!session) {
		return (
			<AppShell width="review">
				<section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
					<div className="animate-float mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[rgba(110,231,183,0.14)] text-[var(--accent-mint)]">
						<Sparkles size={34} />
					</div>
					<h1
						className="text-3xl font-bold text-[var(--text-primary)]"
						style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
					>
						Nothing to review
					</h1>
					<p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
						All caught up. Add new cards or head back to the dashboard.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonLink to="/add-card" size="lg">
							Add cards
						</ButtonLink>
						<ButtonLink to="/dashboard" variant="ghost" size="lg">
							Dashboard
						</ButtonLink>
					</div>
				</section>
			</AppShell>
		);
	}

	if (session.completedAt) {
		const ratingBreakdown = session.results.reduce<
			Record<ReviewRating, number>
		>(
			(accumulator, item) => {
				accumulator[item.rating] += 1;
				return accumulator;
			},
			{
				dontKnow: 0,
				ok: 0,
				good: 0,
				excellent: 0,
			},
		);
		const success = session.results.length
			? Math.round(
					(session.results.filter((item) => item.rating !== "dontKnow").length /
						session.results.length) *
						100,
				)
			: 0;

		return (
			<AppShell width="form">
				<section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
					<div className="animate-bounce-in mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]">
						<Trophy size={42} />
					</div>
					<h1
						className="text-4xl font-extrabold text-[var(--text-primary)]"
						style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
					>
						Session complete!
					</h1>
					<p className="mt-3 text-lg text-[var(--text-secondary)]">
						You reviewed {session.results.length} cards
					</p>

					<div className="mt-8 grid w-full max-w-xl grid-cols-3 gap-3">
						{[
							{ label: "Success", value: `${success}%` },
							{ label: "Reviewed", value: session.results.length },
							{ label: "Streak", value: `${dashboard.streak}d` },
						].map((item) => (
							<Surface key={item.label} className="px-4 py-4">
								<p className="text-2xl font-semibold text-[var(--text-primary)]">
									{item.value}
								</p>
								<p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
									{item.label}
								</p>
							</Surface>
						))}
					</div>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
						<span className="text-[#f87171]">
							Again {ratingBreakdown.dontKnow}
						</span>
						<span className="text-[#fb923c]">Hard {ratingBreakdown.ok}</span>
						<span className="text-[#34d399]">Good {ratingBreakdown.good}</span>
						<span className="text-[#60a5fa]">
							Easy {ratingBreakdown.excellent}
						</span>
					</div>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonLink to="/dashboard" size="lg">
							Dashboard
						</ButtonLink>
						<ButtonLink to="/add-card" variant="ghost" size="lg">
							Add cards
						</ButtonLink>
					</div>
				</section>
			</AppShell>
		);
	}

	if (!currentCard) {
		return null;
	}

	const statusPill = buildStatusPill(currentCard);

	return (
		<AppShell width="review">
			<div className="space-y-5">
				<div className="flex items-center justify-between gap-4">
					<ButtonLink
						to="/dashboard"
						variant="ghost"
						size="sm"
						className="shrink-0"
					>
						<ArrowLeft size={16} />
						<span className="hidden sm:inline">Back</span>
					</ButtonLink>
					<div className="flex items-center gap-3">
						<p className="text-sm text-[var(--text-secondary)]">
							{currentIndex} / {totalCount}
						</p>
						<div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-gold-dim)] px-3 py-1.5 text-sm text-[var(--accent-gold)]">
							<Flame size={14} />
							{dashboard.streak}d
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-full bg-[var(--bg-active)]">
					<div
						className="h-1.5 rounded-full bg-[linear-gradient(90deg,#ffd56f,var(--accent-gold))] transition-[width] duration-300"
						style={{ width: `${progress * 100}%` }}
					/>
				</div>

				<div className="flex justify-center">
					<div
						className={cn(
							"rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
							statusPill.className,
						)}
					>
						{statusPill.label}
					</div>
				</div>

				<div className="flex min-h-[50vh] flex-col justify-center">
					<div
						key={cardKey}
						className={cn("mx-auto w-full max-w-2xl", animClass)}
					>
						<button
							type="button"
							onClick={() => !isSubmitting && setFlipped((value) => !value)}
							className="h-[min(50vh,400px)] min-h-[280px] w-full [perspective:1200px] text-left"
						>
							<div
								className={cn(
									"relative h-full w-full [transform-style:preserve-3d] transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
									flipped && "[transform:rotateY(180deg)]",
								)}
							>
								<div className="absolute inset-0 flex flex-col rounded-[20px] border border-[color:var(--border-medium)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface),var(--bg-elevated))] p-6 [backface-visibility:hidden] shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
									<div className="flex items-start justify-between text-xs text-[var(--text-tertiary)]">
										<span />
										<span>{activeLanguage.emoji}</span>
									</div>
									<div className="my-auto text-center">
										<p
											className="text-4xl font-bold text-[var(--text-primary)] md:text-5xl"
											style={{
												fontFamily: "var(--font-display)",
												fontWeight: 700,
											}}
										>
											{getPromptDisplay(
												currentCard.languageId,
												currentCard.prompt,
												currentCard.pronunciation,
											)}
										</p>
										{currentCard.pronunciation ? (
											<p className="mt-4 text-base italic text-[var(--text-tertiary)]">
												/{currentCard.pronunciation}/
											</p>
										) : null}
									</div>
									<p className="text-center text-xs text-[var(--text-tertiary)]">
										Tap to reveal
									</p>
								</div>

								<div className="absolute inset-0 flex flex-col rounded-[20px] border border-[rgba(245,183,49,0.2)] bg-[linear-gradient(165deg,#1a1832,var(--bg-surface),#18202e)] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
										Answer
									</p>
									<div className="my-auto">
										<p
											className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
											style={{
												fontFamily: "var(--font-display)",
												fontWeight: 700,
											}}
										>
											{currentCard.translation}
										</p>
										{currentCard.example ? (
											<p className="mt-4 text-base italic text-[var(--text-secondary)]">
												“
												{getExampleDisplay(
													currentCard.languageId,
													currentCard.example,
												)}
												”
											</p>
										) : null}
										{currentCard.note ? (
											<p className="mt-4 text-sm text-[var(--accent-lavender)]">
												{currentCard.note}
											</p>
										) : null}
										{currentCard.tags.length > 0 ? (
											<div className="mt-4 flex flex-wrap gap-2">
												{currentCard.tags.map((tag) => (
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
								</div>
							</div>
						</button>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{RATING_META.map((item) => (
						<button
							key={item.rating}
							type="button"
							disabled={isSubmitting}
							onClick={() => void submitRating(item.rating)}
							className="rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-px disabled:opacity-60"
							style={{
								borderColor: item.glow,
								background: `${item.glow.replace("0.2", "0.08")}`,
								color: item.color,
								boxShadow: `0 0 0 rgba(0,0,0,0)`,
							}}
						>
							<p className="text-sm font-semibold">{item.label}</p>
							<p className="mt-1 text-[10px] opacity-60">
								{previews.get(item.rating) ?? "now"}
							</p>
						</button>
					))}
				</div>

				<p className="text-center text-xs text-[var(--text-tertiary)]">
					Keyboard: Space to flip, 1-4 to rate
				</p>
			</div>
		</AppShell>
	);
}
