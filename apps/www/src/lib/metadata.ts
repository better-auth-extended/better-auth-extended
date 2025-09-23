import type { Metadata } from "next/types";

export const createMetadata = (override: Metadata): Metadata => {
	return {
		icons: [
			{
				media: "(prefers-color-scheme: light)",
				url: "/icon-light.png",
				href: "/icon-light.png",
			},
			{
				media: "(prefers-color-scheme: dark)",
				url: "/icon-dark.png",
				href: "/icon-dark.png",
			},
		],
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: baseUrl,
			images: `${baseUrl}og.png`,
			siteName: "better-auth-extended",
			...override.openGraph,
		},
		twitter: {
			card: "summary_large_image",
			creator: "@j_slno",
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			images: `${baseUrl}og.png`,
			...override.twitter,
		},
	};
};

export const baseUrl =
	process.env.NODE_ENV === "development"
		? new URL("http://localhost:3000")
		: new URL(`https://${process.env.VERCEL_URL!}`);
