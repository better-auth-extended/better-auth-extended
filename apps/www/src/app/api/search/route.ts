import { source } from "@/lib/source";
import { AdvancedIndex, createSearchAPI } from "fumadocs-core/search/server";
import { resources } from "~/resources";

export const { GET } = createSearchAPI("advanced", {
	language: "english",
	indexes: [
		...source.getPages().map((page) => ({
			title: page.data.title,
			description: page.data.description,
			url: page.url,
			id: `docs:${page.url}`,
			structuredData: page.data.structuredData,
			tag: "docs",
		})),
		...resources.map(
			(resource) =>
				({
					id: `resources:${resource.name}`,
					title: resource.name,
					description: resource.description,
					url: `/marketplace#${resource.name}`,
					structuredData: {
						headings: [],
						contents: [],
					},
					tag: ["resources", resource.category],
				}) satisfies AdvancedIndex,
		),
	],
});
