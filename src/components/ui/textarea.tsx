import type { TextareaHTMLAttributes } from "react";

import { cn } from "#/shared/lib/cn";

function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(
				"flex min-h-24 w-full rounded-2xl border border-[color:var(--border-medium)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-primary)] transition [font:inherit] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(245,183,49,0.12)] focus-visible:border-[color:var(--accent-gold)]",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
