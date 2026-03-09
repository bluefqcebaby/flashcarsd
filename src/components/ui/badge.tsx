import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "#/shared/lib/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium",
	{
		variants: {
			variant: {
				default:
					"border-[rgba(245,183,49,0.18)] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)]",
				secondary:
					"border-[color:var(--border-medium)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
				accent:
					"border-[rgba(94,234,212,0.22)] bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]",
				warm: "border-[rgba(167,139,250,0.22)] bg-[rgba(167,139,250,0.14)] text-[var(--accent-lavender)]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type BadgeProps = HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
