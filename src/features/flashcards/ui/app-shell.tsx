import { Link, useLocation } from "@tanstack/react-router";
import {
	LayoutDashboard,
	Plus,
	Settings,
	Shuffle,
	Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { ButtonLink } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import { cn } from "#/shared/lib/cn";

const NAV_ITEMS = [
	{
		to: "/dashboard",
		label: "Home",
		icon: LayoutDashboard,
	},
	{
		to: "/add-card",
		label: "Add",
		icon: Plus,
	},
	{
		to: "/review",
		label: "Review",
		icon: Shuffle,
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings,
	},
] as const;

const WIDTH_CLASSES = {
	dashboard: "max-w-2xl",
	form: "max-w-lg",
	review: "max-w-4xl",
} as const;

export function AppShell({
	children,
	width = "dashboard",
}: {
	children: ReactNode;
	width?: keyof typeof WIDTH_CLASSES;
}) {
	const location = useLocation();

	return (
		<div className="min-h-screen pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-10">
			<header className="fixed inset-x-0 top-0 z-40 hidden border-b border-[color:var(--border-subtle)] bg-[rgba(21,19,32,0.95)] backdrop-blur-xl md:block">
				<div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-4">
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-3 text-[var(--text-primary)]"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] shadow-[var(--glow-gold)]">
							<Sparkles size={18} />
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
								Kana
							</p>
							<p className="text-sm text-[var(--text-secondary)]">
								Vocabulary deck
							</p>
						</div>
					</Link>

					<nav className="flex items-center gap-1 rounded-2xl border border-[color:var(--border-subtle)] bg-[rgba(28,26,43,0.82)] p-1.5">
						{NAV_ITEMS.map((item) => {
							const Icon = item.icon;
							const active = location.pathname === item.to;
							return (
								<Link
									key={item.to}
									to={item.to}
									className={cn(
										"inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[var(--text-tertiary)] transition hover:bg-white/4 hover:text-[var(--text-primary)]",
										active &&
											"bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]",
									)}
								>
									<Icon size={16} />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>
			</header>

			<main
				className={cn(
					"mx-auto w-full px-4 py-8 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pt-26 md:pb-12",
					WIDTH_CLASSES[width],
				)}
			>
				{children}
			</main>

			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border-subtle)] bg-[rgba(21,19,32,0.95)] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
				<Surface
					variant="subtle"
					className="mx-auto grid max-w-lg grid-cols-4 gap-2 p-2"
				>
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						const active = location.pathname === item.to;
						return (
							<ButtonLink
								key={item.to}
								to={item.to}
								variant={active ? "subtle" : "ghost"}
								size="sm"
								className={cn(
									active &&
										"border-[color:var(--border-accent)] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] visited:text-[var(--accent-gold)]",
									"flex-col gap-1 rounded-2xl py-3",
								)}
							>
								<Icon size={16} />
								<span className={cn(item.label === "Settings" && "sr-only")}>
									{item.label}
								</span>
							</ButtonLink>
						);
					})}
				</Surface>
			</nav>
		</div>
	);
}
