import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Sparkles } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import {
	DEFAULT_NATIVE_LANGUAGE_ID,
	getLanguageOption,
	getNativeLanguageLabel,
	LANGUAGE_OPTIONS,
	NATIVE_LANGUAGE_OPTIONS,
} from "#/features/flashcards/model/languages";
import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";
import { cn } from "#/shared/lib/cn";

const FEATURE_ITEMS = [
	{ icon: BookOpen, label: "Create cards" },
	{ icon: Brain, label: "Smart review" },
	{ icon: Sparkles, label: "Track progress" },
] as const;

export function OnboardingPage() {
	const navigate = useNavigate();
	const { state, updateOnboardingDraft, completeOnboarding } =
		useFlashcardsApp();
	const step = Math.min(Math.max(state.onboardingDraft.step ?? 0, 0), 3);
	const selectedLanguage = getLanguageOption(
		state.onboardingDraft.targetLanguageId,
	);

	const setStep = (nextStep: number) => {
		updateOnboardingDraft({ step: nextStep });
	};

	const finishOnboarding = async (startWithStarterDeck: boolean) => {
		if (!selectedLanguage) {
			return;
		}

		await completeOnboarding({
			targetLanguageId: selectedLanguage.id,
			nativeLanguageId:
				state.onboardingDraft.nativeLanguageId || DEFAULT_NATIVE_LANGUAGE_ID,
			startWithStarterDeck,
		});
		navigate({ to: "/dashboard" });
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<Surface className="animate-scale-in w-full max-w-2xl px-6 py-8 md:px-8 md:py-10">
				{step > 0 ? (
					<button
						type="button"
						onClick={() => setStep(step - 1)}
						className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
					>
						<ArrowLeft size={16} />
						Back
					</button>
				) : (
					<div className="mb-8" />
				)}

				{step === 0 ? (
					<section className="flex min-h-[32rem] flex-col items-center justify-center text-center">
						<div className="animate-pulse-glow mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]">
							<Sparkles size={34} />
						</div>
						<h1
							className="text-4xl font-extrabold text-[var(--text-primary)] md:text-5xl"
							style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
						>
							Welcome to Kana
						</h1>
						<p className="mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
							A playful way to build your vocabulary, one card at a time.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							{FEATURE_ITEMS.map((item, index) => {
								const Icon = item.icon;
								return (
									<Surface
										key={item.label}
										className={cn(
											"animate-fade-up flex min-w-34 flex-col items-center gap-3 px-4 py-4 text-center",
											index === 1 && "delay-1",
											index === 2 && "delay-2",
										)}
									>
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-teal-dim)] text-[var(--accent-teal)] shadow-[var(--glow-teal)]">
											<Icon size={20} />
										</div>
										<p className="text-sm font-semibold text-[var(--text-primary)]">
											{item.label}
										</p>
									</Surface>
								);
							})}
						</div>

						<Button
							size="lg"
							className="mt-12 min-w-52"
							onClick={() => setStep(1)}
						>
							Get started
							<ArrowRight size={18} />
						</Button>
					</section>
				) : null}

				{step === 1 ? (
					<section className="animate-fade-up">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Step 2
						</p>
						<h2
							className="mt-2 text-3xl font-bold text-[var(--text-primary)]"
							style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
						>
							What language are you learning?
						</h2>
						<p className="mt-3 text-base text-[var(--text-secondary)]">
							Pick your target language. You can change this later.
						</p>

						<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
							{LANGUAGE_OPTIONS.map((language) => {
								const selected =
									state.onboardingDraft.targetLanguageId === language.id;
								return (
									<button
										key={language.id}
										type="button"
										onClick={() =>
											updateOnboardingDraft({ targetLanguageId: language.id })
										}
										className={cn(
											"rounded-2xl border border-[color:var(--border-subtle)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface))] px-4 py-4 text-left transition hover:-translate-y-0.5",
											selected &&
												"border-[color:var(--border-accent)] bg-[var(--accent-gold-dim)] shadow-[var(--glow-gold)]",
										)}
									>
										<span className="text-2xl">{language.emoji}</span>
										<div>
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{language.label}
											</p>
											<p className="text-xs text-[var(--text-tertiary)]">
												{language.nativeLabel}
											</p>
										</div>
									</button>
								);
							})}
						</div>

						<Button
							size="lg"
							className="mt-8 w-full"
							disabled={!selectedLanguage}
							onClick={() => setStep(2)}
						>
							Continue
						</Button>
					</section>
				) : null}

				{step === 2 ? (
					<section className="animate-fade-up">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Step 3
						</p>
						<h2
							className="mt-2 text-3xl font-bold text-[var(--text-primary)]"
							style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
						>
							What&apos;s your native language?
						</h2>
						<p className="mt-3 text-base text-[var(--text-secondary)]">
							Translations will be shown in this language.
						</p>

						<div className="mt-8 grid grid-cols-2 gap-3">
							{NATIVE_LANGUAGE_OPTIONS.map((language) => {
								const selected =
									state.onboardingDraft.nativeLanguageId === language.id;
								return (
									<button
										key={language.id}
										type="button"
										onClick={() =>
											updateOnboardingDraft({ nativeLanguageId: language.id })
										}
										className={cn(
											"rounded-2xl border border-[color:var(--border-subtle)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface))] px-4 py-4 text-left text-sm font-semibold transition hover:-translate-y-0.5",
											selected &&
												"border-[color:var(--border-accent)] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] shadow-[var(--glow-gold)]",
										)}
									>
										{language.label}
									</button>
								);
							})}
						</div>

						<Button
							size="lg"
							className="mt-8 w-full"
							onClick={() => setStep(3)}
						>
							Almost done
						</Button>
					</section>
				) : null}

				{step === 3 ? (
					<section className="flex min-h-[30rem] flex-col items-center justify-center text-center">
						<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--accent-gold-dim)] text-4xl shadow-[var(--glow-gold)]">
							{selectedLanguage?.emoji ?? "🌍"}
						</div>
						<h2
							className="text-4xl font-extrabold text-[var(--text-primary)]"
							style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
						>
							You&apos;re all set!
						</h2>
						<p className="mt-4 max-w-lg text-lg text-[var(--text-secondary)]">
							Learning {selectedLanguage?.label ?? "your language"} with{" "}
							{getNativeLanguageLabel(state.onboardingDraft.nativeLanguageId)}{" "}
							translations. Want some starter vocabulary to try the app?
						</p>

						<div className="mt-10 flex w-full max-w-sm flex-col gap-3">
							<Button
								size="lg"
								className="w-full"
								onClick={() => void finishOnboarding(true)}
							>
								<Sparkles size={18} />
								Load sample cards &amp; explore
							</Button>
							<Button
								size="lg"
								variant="ghost"
								className="w-full"
								onClick={() => void finishOnboarding(false)}
							>
								Start from scratch
							</Button>
						</div>
					</section>
				) : null}

				<div className="mt-8 flex items-center justify-center gap-2">
					{[0, 1, 2, 3].map((dot) => {
						const stateClass =
							dot === step
								? "w-6 bg-[var(--accent-gold)]"
								: dot < step
									? "bg-[rgba(245,183,49,0.55)]"
									: "bg-[var(--bg-active)]";
						return (
							<div
								key={`step-${dot}`}
								className={cn(
									"h-2 w-2 rounded-full transition-all",
									stateClass,
								)}
							/>
						);
					})}
				</div>
			</Surface>
		</main>
	);
}
