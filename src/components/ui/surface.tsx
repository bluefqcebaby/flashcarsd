import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "#/shared/lib/cn";

const surfaceVariants = cva(
	"rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_22px_60px_rgba(0,0,0,0.26)]",
	{
		variants: {
			variant: {
				default:
					"border-[color:var(--border-subtle)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface))]",
				glow: "border-[color:var(--border-accent)] bg-[linear-gradient(165deg,var(--bg-elevated),var(--bg-surface))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_20px_rgba(245,183,49,0.15),0_0_60px_rgba(245,183,49,0.05),0_22px_60px_rgba(0,0,0,0.26)]",
				subtle:
					"border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type SurfaceProps = HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof surfaceVariants>;

export function Surface({ className, variant, ...props }: SurfaceProps) {
	return (
		<div className={cn(surfaceVariants({ variant }), className)} {...props} />
	);
}
