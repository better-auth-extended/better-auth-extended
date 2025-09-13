import type { PlopTypes } from "@turbo/gen";
import { PACKAGE_PREFIX } from "../config";

const sanitize = (answers: Record<string, any> | undefined) => {
	if (!answers) {
		throw new Error("Generator answers are required");
	}

	if (
		"name" in answers &&
		typeof answers.name === "string" &&
		answers.name.startsWith(PACKAGE_PREFIX)
	) {
		answers.name = answers.name.substring(PACKAGE_PREFIX.length);
	}

	console.log("Config sanitized");
};

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
		{
			type: "confirm",
			name: "addSchema",
			message: "Does the plugin add an additional schema?",
		},
	],
	actions: (answers) => {
		sanitize(answers);

		return [
			{
				type: "addMany",
				base: "plugin/template",
				destination: "packages/plugins/{{name}}",
				templateFiles: "plugin/template/**/*",
			},
			{
				type: "add",
				path: "packages/plugins/{{name}}/src/{{name}}.test.ts",
				templateFile: "plugin/common/plugin.test.ts.hbs",
			},
			answers?.addSchema && {
				type: "add",
				path: "packages/plugins/{{name}}/src/schema.ts",
				templateFile: "plugin/conditional/schema.ts.hbs",
			},
		].filter(Boolean);
	},
} satisfies PlopTypes.PlopGeneratorConfig;
