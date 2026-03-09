import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import type {
	ButtonHTMLAttributes,
	ComponentProps,
	CSSProperties,
} from "react";

import { cn } from "#/shared/lib/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold no-underline transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-gold)] disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				primary:
					"border-[color:var(--border-accent)] bg-[linear-gradient(180deg,#ffd56f_0%,var(--accent-gold)_100%)] text-[var(--text-inverse)] visited:text-[var(--text-inverse)] shadow-[0_10px_30px_rgba(245,183,49,0.2),inset_0_1px_0_rgba(255,255,255,0.32)] hover:-translate-y-px hover:text-[var(--text-inverse)] hover:shadow-[0_14px_36px_rgba(245,183,49,0.26),inset_0_1px_0_rgba(255,255,255,0.4)] active:translate-y-0",
				ghost:
					"border-[color:var(--border-subtle)] bg-transparent text-[var(--text-secondary)] visited:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
				outline:
					"border-[color:var(--border-medium)] bg-transparent text-[var(--text-primary)] visited:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
				subtle:
					"border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] visited:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
				danger:
					"border-[rgba(252,165,165,0.3)] bg-[rgba(252,165,165,0.1)] text-[var(--accent-coral)] visited:text-[var(--accent-coral)] hover:bg-[rgba(252,165,165,0.14)]",
			},
			size: {
				default: "h-12 px-5",
				sm: "h-10 px-4 text-sm",
				lg: "h-14 px-6 text-base",
				icon: "h-11 w-11",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;
type ButtonLinkProps = ComponentProps<typeof Link> &
	VariantProps<typeof buttonVariants>;

function getVariantStyle(
	variant: VariantProps<typeof buttonVariants>["variant"],
): CSSProperties {
	switch (variant) {
		case "ghost":
			return { color: "var(--text-secondary)" };
		case "outline":
		case "subtle":
			return { color: "var(--text-primary)" };
		case "danger":
			return { color: "var(--accent-coral)" };
		default:
			return { color: "var(--text-inverse)" };
	}
}

function Button({ className, size, variant, ...props }: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ size, variant }), className)}
			style={{
				...getVariantStyle(variant),
				...props.style,
			}}
			{...props}
		/>
	);
}

function ButtonLink({ className, size, variant, ...props }: ButtonLinkProps) {
	return (
		<Link
			className={cn(buttonVariants({ size, variant }), className)}
			style={{
				...getVariantStyle(variant),
				...props.style,
			}}
			{...props}
		/>
	);
}

export { Button, ButtonLink, buttonVariants };
