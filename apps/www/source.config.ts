import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkAutoTypeTable, createGenerator } from "fumadocs-typescript";
import { remarkNpm } from "fumadocs-core/mdx-plugins";

export const docs = defineDocs({
	dir: "content/docs",
});

const generator = createGenerator();

export default defineConfig({
	mdxOptions: {
		remarkPlugins: [
			[
				remarkNpm,
				{
					persist: {
						id: "persist-install",
					},
				},
			],
			[remarkAutoTypeTable, { generator }],
		],
	},
});
