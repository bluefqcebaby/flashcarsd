import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "#/shared/lib/cn";

const buttonStyles = cva(
	"inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-strong)] disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				primary:
					"border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] text-white shadow-[0_18px_30px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.1))]",
				secondary:
					"border-white/10 bg-white/6 text-[var(--text-primary)] hover:-translate-y-0.5 hover:bg-white/10",
				ghost:
					"border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-white/6",
				tint: "border-[color:var(--accent-glow)] bg-[color:var(--accent-soft)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[color:var(--accent-strong)]",
			},
			size: {
				sm: "h-10 px-4",
				md: "h-12 px-5",
				lg: "h-14 px-6",
				icon: "h-11 w-11",
			},
		},
		defaultVariants: {
			variant: "secondary",
			size: "md",
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonStyles>;

export function Button({ className, size, variant, ...props }: ButtonProps) {
	return (
		<button
			className={cn(buttonStyles({ size, variant }), className)}
			{...props}
		/>
	);
}

export { buttonStyles };
