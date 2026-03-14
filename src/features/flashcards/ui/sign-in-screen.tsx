import { LogIn, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Surface } from "#/components/ui/surface";
import { useFlashcardsAppSettings } from "#/features/flashcards/ui/flashcards-app-provider";

export function SignInScreen() {
	const { signInWithGoogle } = useFlashcardsAppSettings();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	return (
		<main className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,183,49,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(61,213,152,0.14),transparent_30%),linear-gradient(180deg,#08070d_0%,#12101c_45%,#171427_100%)]" />
			<div className="relative w-full max-w-md">
				<Surface
					variant="glow"
					className="animate-fade-in px-7 py-8 text-center"
				>
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] shadow-[var(--glow-gold)]">
						<Sparkles size={22} />
					</div>
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
						Kana
					</p>
					<h1
						className="mt-3 text-3xl font-bold text-[var(--text-primary)]"
						style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
					>
						Private decks, private review history
					</h1>
					<p className="mt-3 text-sm text-[var(--text-secondary)]">
						Sign in with Google to keep flashcards, study sessions, and language
						settings scoped to your account.
					</p>
					<Button
						className="mt-7 w-full"
						size="lg"
						disabled={isSubmitting}
						onClick={async () => {
							setError(null);
							setIsSubmitting(true);

							try {
								const callbackURL =
									typeof window === "undefined"
										? "/"
										: `${window.location.pathname}${window.location.search}`;
								await signInWithGoogle(callbackURL);
							} catch (nextError) {
								setError(
									nextError instanceof Error
										? nextError.message
										: "Could not start Google sign-in.",
								);
								setIsSubmitting(false);
							}
						}}
					>
						<LogIn size={18} />
						Continue with Google
					</Button>
					<p className="mt-4 text-xs text-[var(--text-tertiary)]">
						Local development callback:
						`http://localhost:1235/api/auth/callback/google`
					</p>
					{error ? (
						<p className="mt-4 text-sm text-[var(--accent-coral)]">{error}</p>
					) : null}
				</Surface>
			</div>
		</main>
	);
}
