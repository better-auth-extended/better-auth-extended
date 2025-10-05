import { source } from "@/lib/source";
import { MetadataRoute } from "next";

export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const url = (path: string): string =>
		new URL(path, "https://better-auth-extended.jsolano.de").toString();

	return [
		{
			url: url("/"),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: url("/marketplace"),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: url("/docs"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		...source.getPages().map((page) => {
			const { lastModified } = page.data;

			return {
				url: url(page.url),
				lastModified,
				changeFrequency: "weekly",
				priority: 0.5,
			} as MetadataRoute.Sitemap[number];
		}),
	];
}
