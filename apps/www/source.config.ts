import {
	defineDocs,
	defineConfig,
	frontmatterSchema,
} from "fumadocs-mdx/config";
import { remarkAutoTypeTable, createGenerator } from "fumadocs-typescript";
import { remarkNpm } from "fumadocs-core/mdx-plugins";
import remarkGithub from "remark-github";
import z from "zod";
import { owner, repo } from "@/lib/github";

export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: frontmatterSchema.extend({
			packageName: z.string().optional(),
		}),
	},
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
			[
				remarkGithub,
				{
					repository: `${owner}/${repo}`,
				},
			],
		],
	},
});
