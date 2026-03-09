import type { ComponentPropsWithoutRef } from "react";

import { cn } from "#/shared/lib/cn";

export function Panel({
	className,
	...props
}: ComponentPropsWithoutRef<"section">) {
	return (
		<section
			className={cn(
				"glass-panel rounded-[28px] border border-white/10 p-5 shadow-[0_28px_70px_rgba(0,0,0,0.22)] md:p-6",
				className,
			)}
			{...props}
		/>
	);
}
