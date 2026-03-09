import { createFileRoute } from "@tanstack/react-router";
import { AppRouteGate } from "#/features/flashcards/ui/app-route-gate";
import { ReviewPage } from "#/features/flashcards/ui/review-page";

export const Route = createFileRoute("/review")({
	component: ReviewRoute,
});

function ReviewRoute() {
	return (
		<AppRouteGate>
			<ReviewPage />
		</AppRouteGate>
	);
}
