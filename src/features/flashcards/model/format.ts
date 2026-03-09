const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatIntervalMinutes(minutes: number) {
	if (minutes < 1) {
		return "now";
	}

	if (minutes < HOUR) {
		return `${Math.round(minutes)} min`;
	}

	if (minutes < DAY) {
		const hours = minutes / HOUR;
		return hours >= 10 ? `${Math.round(hours)} hr` : `${hours.toFixed(1)} hr`;
	}

	if (minutes < WEEK) {
		const days = minutes / DAY;
		return days >= 10 ? `${Math.round(days)} d` : `${days.toFixed(1)} d`;
	}

	const weeks = minutes / WEEK;
	return weeks >= 8 ? `${Math.round(weeks)} wk` : `${weeks.toFixed(1)} wk`;
}

export function formatShortDate(dateString: string) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
	}).format(new Date(dateString));
}

export function formatCompactDateTime(dateString: string) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(dateString));
}

export function relativeDayLabel(dateString: string, now = Date.now()) {
	const startOfTarget = startOfDay(new Date(dateString)).getTime();
	const startOfNow = startOfDay(new Date(now)).getTime();
	const deltaDays = Math.round(
		(startOfTarget - startOfNow) / (24 * 60 * 60 * 1000),
	);

	if (deltaDays === 0) {
		return "Today";
	}

	if (deltaDays === 1) {
		return "Tomorrow";
	}

	if (deltaDays === -1) {
		return "Yesterday";
	}

	if (deltaDays > 1 && deltaDays < 7) {
		return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
			new Date(dateString),
		);
	}

	if (deltaDays < -1 && deltaDays > -7) {
		return `${Math.abs(deltaDays)} days ago`;
	}

	return formatShortDate(dateString);
}

export function formatPercent(value: number) {
	return `${Math.round(value)}%`;
}

export function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}
