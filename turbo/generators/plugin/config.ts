import type { PlopTypes } from "@turbo/gen";

const PACKAGE_PREFIX = "@better-auth-extended/" as const;

export default {
	description: "Generate a new plugin starter",
	prompts: [
		{
			type: "input",
			name: "name",
			validate: (input) => !!input,
			message:
				"What is the name of the plugin? (You can skip the `@better-auth-extended/` prefix)",
		},
		{
			type: "input",
			name: "description",
			message: "What is the plugin about?",
		},
	],
	actions: [
		(answers: any) => {
			if (
				"name" in answers &&
				typeof answers.name === "string" &&
				answers.name.startsWith(PACKAGE_PREFIX)
			) {
				answers.name = answers.name.substring(0, PACKAGE_PREFIX.length);
			}

			return "Config sanitized";
		},
		{
			type: "addMany",
			base: "plugin/template",
			destination: "packages/plugins/{{name}}",
			templateFiles: "plugin/template/**/*",
		},
		{
			type: "add",
			path: "packages/plugins/{{name}}/src/{{name}}.test.ts",
			templateFile: "plugin/plugin.test.ts.hbs",
		},
	],
} satisfies PlopTypes.PlopGeneratorConfig;
