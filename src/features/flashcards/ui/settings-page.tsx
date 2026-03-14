import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Globe, Languages, LogOut, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import {
	getNativeLanguageLabel,
	LANGUAGE_OPTIONS,
	NATIVE_LANGUAGE_OPTIONS,
} from "#/features/flashcards/model/languages";
import { AppShell } from "#/features/flashcards/ui/app-shell";
import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";
import { cn } from "#/shared/lib/cn";

export function SettingsPage() {
	const navigate = useNavigate();
	const {
		state,
		activeLanguage,
		activateLanguage,
		setNativeLanguage,
		resetApp,
		signOut,
	} = useFlashcardsApp();
	const [confirmReset, setConfirmReset] = useState(false);
	const cardCounts = useMemo(
		() =>
			state.cards.reduce<Record<string, number>>((accumulator, card) => {
				accumulator[card.languageId] = (accumulator[card.languageId] ?? 0) + 1;
				return accumulator;
			}, {}),
		[state.cards],
	);

	return (
		<AppShell width="form">
			<div className="space-y-5">
				<div>
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
					>
						<ArrowLeft size={16} />
						Back
					</Link>
					<h1
						className="mt-4 text-3xl font-bold text-[var(--text-primary)]"
						style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
					>
						Settings
					</h1>
				</div>

				<Surface className="px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]">
							<Globe size={18} />
						</div>
						<div>
							<p className="text-base font-semibold text-[var(--text-primary)]">
								Target Language
							</p>
							<p className="text-sm text-[var(--text-secondary)]">
								{cardCounts[activeLanguage?.id ?? ""] ?? 0} cards in the current
								deck
							</p>
						</div>
					</div>

					<div className="mt-5 grid grid-cols-3 gap-3">
						{LANGUAGE_OPTIONS.map((language) => {
							const selected = activeLanguage?.id === language.id;
							return (
								<button
									key={language.id}
									type="button"
									onClick={() =>
										void activateLanguage({ languageId: language.id })
									}
									className={cn(
										"rounded-2xl border border-[color:var(--border-subtle)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface))] px-3 py-3 text-center transition hover:-translate-y-0.5",
										selected &&
											"border-[color:var(--border-accent)] bg-[var(--accent-gold-dim)] shadow-[var(--glow-gold)]",
									)}
								>
									<p className="text-xl">{language.emoji}</p>
									<p className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
										{language.label}
									</p>
								</button>
							);
						})}
					</div>
				</Surface>

				<Surface className="px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
							<Languages size={18} />
						</div>
						<div>
							<p className="text-base font-semibold text-[var(--text-primary)]">
								Translation Language
							</p>
							<p className="text-sm text-[var(--text-secondary)]">
								Currently showing{" "}
								{getNativeLanguageLabel(state.settings.nativeLanguageId)}{" "}
								translations
							</p>
						</div>
					</div>

					<select
						className="mt-5 flex h-12 w-full rounded-2xl border border-[color:var(--border-medium)] bg-[var(--bg-surface)] px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-gold)]"
						value={state.settings.nativeLanguageId}
						onChange={(event) => setNativeLanguage(event.target.value)}
					>
						{NATIVE_LANGUAGE_OPTIONS.map((language) => (
							<option key={language.id} value={language.id}>
								{language.label}
							</option>
						))}
					</select>
				</Surface>

				<Surface className="border-[rgba(252,165,165,0.24)] px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(96,165,250,0.12)] text-[#93c5fd]">
							<LogOut size={18} />
						</div>
						<div>
							<p className="text-base font-semibold text-[var(--text-primary)]">
								Sign Out
							</p>
							<p className="text-sm text-[var(--text-secondary)]">
								End this session and return to Google sign-in.
							</p>
						</div>
					</div>

					<Button
						variant="outline"
						className="mt-5 w-full"
						onClick={async () => {
							await signOut();
							navigate({ to: "/" });
						}}
					>
						Sign out
					</Button>
				</Surface>

				<Surface className="border-[rgba(252,165,165,0.24)] px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(252,165,165,0.12)] text-[var(--accent-coral)]">
							<Trash2 size={18} />
						</div>
						<div>
							<p className="text-base font-semibold text-[var(--accent-coral)]">
								Reset App
							</p>
							<p className="text-sm text-[var(--text-secondary)]">
								Delete all decks, review history, settings, and drafts.
							</p>
						</div>
					</div>

					<div className="mt-5">
						{confirmReset ? (
							<div className="flex flex-col gap-3 sm:flex-row">
								<Button
									variant="danger"
									className="flex-1"
									onClick={async () => {
										await resetApp();
										navigate({ to: "/onboarding" });
									}}
								>
									Yes, delete everything
								</Button>
								<Button
									variant="ghost"
									className="flex-1"
									onClick={() => setConfirmReset(false)}
								>
									Cancel
								</Button>
							</div>
						) : (
							<Button
								variant="danger"
								className="w-full"
								onClick={() => setConfirmReset(true)}
							>
								Reset all data
							</Button>
						)}
					</div>
				</Surface>
			</div>
		</AppShell>
	);
}
