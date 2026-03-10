import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { FlashcardsAppProvider } from "#/features/flashcards/ui/flashcards-app-provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Kana",
			},
			{
				name: "theme-color",
				content: "#0c0a14",
			},
			{
				name: "description",
				content:
					"Playful vocabulary flashcards with local persistence and spaced repetition.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	useEffect(() => {
		if (import.meta.env.DEV) {
			void import("react-grab");
		}
	}, []);

	return (
		<FlashcardsAppProvider>
			<Outlet />
		</FlashcardsAppProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="dark font-sans antialiased [overflow-wrap:anywhere]">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
