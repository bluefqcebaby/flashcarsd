import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	BookOpen,
	Calendar,
	Clock,
	Flame,
	Plus,
	Shuffle,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";

import { ButtonLink } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import { getPromptDisplay } from "#/features/flashcards/model/display";
import { getDashboardSnapshot } from "#/features/flashcards/model/selectors";
import { AppShell } from "#/features/flashcards/ui/app-shell";
import { useFlashcardsApp } from "#/features/flashcards/ui/flashcards-app-provider";
import { cn } from "#/shared/lib/cn";

export function DashboardPage() {
	const { state, activeLanguage } = useFlashcardsApp();
	const snapshot = getDashboardSnapshot(state);

	if (!activeLanguage) {
		return null;
	}

	if (snapshot.cardCount === 0) {
		return (
			<AppShell width="dashboard">
				<section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
					<div className="animate-float mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] shadow-[var(--glow-gold)]">
						<BookOpen size={40} />
					</div>
					<h1
						className="text-4xl font-extrabold text-[var(--text-primary)] md:text-5xl"
						style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
					>
						Your {activeLanguage.label} journey starts here
					</h1>
					<p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
						Add your first vocabulary cards and your review rhythm will start to
						take shape.
					</p>
					<ButtonLink to="/add-card" size="lg" className="mt-8">
						<Plus size={18} />
						Add your first card
					</ButtonLink>
				</section>
			</AppShell>
		);
	}

	const masteryTotal = Math.max(
		1,
		snapshot.mastery.fresh +
			snapshot.mastery.familiar +
			snapshot.mastery.solid +
			snapshot.mastery.mastered,
	);
	const forecastPeak = Math.max(
		...snapshot.forecast.map((item) => item.count),
		1,
	);
	const greeting = getGreeting();

	return (
		<AppShell width="dashboard">
			<div className="space-y-5">
				<header className="animate-fade-up">
					<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
						<span className="text-lg">{activeLanguage.emoji}</span>
						{activeLanguage.label}
					</p>
					<h1
						className="mt-3 text-4xl font-extrabold text-[var(--text-primary)] md:text-5xl"
						style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
					>
						{greeting}
					</h1>
				</header>

				<section className="animate-fade-up delay-1 grid grid-cols-3 gap-3">
					{[
						{
							icon: Flame,
							value: `${snapshot.streak}d`,
							label: "STREAK",
							iconClass:
								"bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]",
						},
						{
							icon: Target,
							value: snapshot.cardCount,
							label: "CARDS",
							iconClass:
								"bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]",
						},
						{
							icon: TrendingUp,
							value: snapshot.hasReviewData
								? `${Math.round(snapshot.retention)}%`
								: "--",
							label: "SUCCESS",
							iconClass:
								"bg-[rgba(110,231,183,0.14)] text-[var(--accent-mint)]",
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<Surface
								key={item.label}
								className="flex flex-col items-center gap-3 px-4 py-5 text-center"
							>
								<div
									className={cn(
										"flex h-11 w-11 items-center justify-center rounded-2xl",
										item.iconClass,
									)}
								>
									<Icon size={18} />
								</div>
								<div>
									<p className="text-2xl font-semibold text-[var(--text-primary)]">
										{item.value}
									</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
										{item.label}
									</p>
								</div>
							</Surface>
						);
					})}
				</section>

				<section className="animate-fade-up delay-2">
					{snapshot.dueCount > 0 ? (
						<Link
							to="/review"
							className="block transition hover:-translate-y-0.5"
						>
							<Surface
								variant="glow"
								className="flex items-center justify-between gap-4 px-5 py-5"
							>
								<div className="min-w-0 flex-1">
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
										Ready to review
									</p>
									<p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
										{snapshot.dueCount} cards due
									</p>
									<p className="mt-2 text-xs text-[var(--text-tertiary)]">
										{snapshot.dueNewCount} new + {snapshot.dueReviewCount} review
									</p>
								</div>
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-gold)] text-[var(--text-inverse)]">
									<Shuffle size={20} />
								</div>
							</Surface>
						</Link>
					) : (
						<Surface className="flex items-center justify-center px-5 py-6 text-center text-[var(--accent-mint)]">
							All caught up!
						</Surface>
					)}
				</section>

				<Surface className="animate-fade-up delay-3 px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(167,139,250,0.14)] text-[var(--accent-lavender)]">
							<Zap size={18} />
						</div>
						<h2 className="text-lg font-semibold text-[var(--text-primary)]">
							Mastery breakdown
						</h2>
					</div>

					<div className="mt-5 flex h-3 overflow-hidden rounded-full bg-[var(--bg-active)]">
						{[
							{
								label: "Fresh",
								value: snapshot.mastery.fresh,
								color: "var(--accent-lavender)",
							},
							{
								label: "Familiar",
								value: snapshot.mastery.familiar,
								color: "var(--accent-teal)",
							},
							{
								label: "Solid",
								value: snapshot.mastery.solid,
								color: "var(--accent-mint)",
							},
							{
								label: "Mastered",
								value: snapshot.mastery.mastered,
								color: "var(--accent-gold)",
							},
						].map((item) => (
							<div
								key={item.label}
								style={{
									width: `${(item.value / masteryTotal) * 100}%`,
									background: item.color,
								}}
							/>
						))}
					</div>

					<div className="mt-5 grid grid-cols-4 gap-3 text-center">
						{[
							{ label: "Fresh", value: snapshot.mastery.fresh },
							{ label: "Familiar", value: snapshot.mastery.familiar },
							{ label: "Solid", value: snapshot.mastery.solid },
							{ label: "Mastered", value: snapshot.mastery.mastered },
						].map((item) => (
							<div key={item.label}>
								<p className="text-lg font-semibold text-[var(--text-primary)]">
									{item.value}
								</p>
								<p className="mt-1 text-xs text-[var(--text-tertiary)]">
									{item.label}
								</p>
							</div>
						))}
					</div>
				</Surface>

				<Surface className="animate-fade-up delay-4 px-5 py-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
							<Calendar size={18} />
						</div>
						<h2 className="text-lg font-semibold text-[var(--text-primary)]">
							Next 7 days
						</h2>
					</div>

					<div className="mt-6 grid grid-cols-7 gap-2">
						{snapshot.forecast.map((item, index) => {
							const isToday = index === 0;
							return (
								<div key={item.label} className="text-center">
									<p className="mb-2 h-4 text-xs text-[var(--text-secondary)]">
										{item.count > 0 ? item.count : ""}
									</p>
									<div className="flex h-28 items-end justify-center">
										<div
											className="w-full rounded-t-2xl"
											style={{
												height: `${Math.max(12, (item.count / forecastPeak) * 100)}%`,
												background: isToday
													? "var(--accent-gold)"
													: "var(--bg-active)",
											}}
										/>
									</div>
									<p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
										{item.label}
									</p>
								</div>
							);
						})}
					</div>
				</Surface>

				<div className="grid gap-5 sm:grid-cols-2">
					{snapshot.hardCards.length > 0 ? (
						<Surface className="animate-fade-up delay-5 px-5 py-5">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(252,165,165,0.14)] text-[var(--accent-coral)]">
									<AlertTriangle size={18} />
								</div>
								<h2 className="text-lg font-semibold text-[var(--text-primary)]">
									Tricky cards
								</h2>
							</div>

							<div className="mt-5 space-y-3">
								{snapshot.hardCards.map((card) => (
									<div
										key={card.id}
										className="rounded-2xl bg-[var(--bg-base)] px-4 py-3"
									>
										<p className="text-sm font-medium text-[var(--text-primary)]">
											{getPromptDisplay(activeLanguage.id, card.prompt)}
										</p>
										<p className="mt-1 text-xs text-[var(--accent-coral)]">
											{card.lapses} lapses
										</p>
									</div>
								))}
							</div>
						</Surface>
					) : null}

					<Surface className="animate-fade-up delay-6 px-5 py-5">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]">
								<Clock size={18} />
							</div>
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">
								Recently added
							</h2>
						</div>

						<div className="mt-5 space-y-3">
							{snapshot.recentlyAdded.length > 0 ? (
								snapshot.recentlyAdded.map((card) => (
									<div
										key={card.id}
										className="rounded-2xl bg-[var(--bg-base)] px-4 py-3"
									>
										<p className="text-sm font-medium text-[var(--text-primary)]">
											{getPromptDisplay(activeLanguage.id, card.prompt)}
										</p>
										<p className="mt-1 text-xs text-[var(--text-secondary)]">
											{card.translation}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-[var(--text-secondary)]">
									No cards added yet.
								</p>
							)}
						</div>
					</Surface>
				</div>

				<div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
					<Surface className="animate-fade-up delay-7 px-5 py-5">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Last session
						</p>
						<p className="mt-3 text-sm text-[var(--text-secondary)]">
							{snapshot.lastSession
								? new Intl.DateTimeFormat("en", {
										month: "short",
										day: "numeric",
									}).format(new Date(snapshot.lastSession.completedAt))
								: "No session yet"}
						</p>
						<p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
							{snapshot.lastSession
								? `${snapshot.lastSession.reviewedCount} cards reviewed`
								: "Start a review run"}
						</p>
					</Surface>

					<Link
						to="/add-card"
						className="animate-fade-up delay-8 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--border-medium)] px-5 py-5 text-[var(--text-secondary)] transition hover:border-[color:var(--border-accent)] hover:bg-[var(--accent-gold-dim)] hover:text-[var(--accent-gold)]"
					>
						<Plus size={18} />
						Add new cards
					</Link>
				</div>
			</div>
		</AppShell>
	);
}

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}

	if (hour < 18) {
		return "Good afternoon";
	}

	return "Good evening";
}
