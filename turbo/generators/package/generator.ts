import type { PlopTypes } from "@turbo/gen";
import { PACKAGE_PREFIX, sanitizeName } from "../helper";

const sanitize = (answers: Record<string, any> | undefined) => {
	if (!answers) {
		throw new Error("Generator answers are required");
	}

	sanitizeName(answers);
	answers.rawName = answers.name;
	if (answers.type === "internal") {
		if (answers.name.startsWith("internal-")) {
			answers.rawName = answers.rawName.substring("internal-".length);
		} else {
			answers.name = `internal-${answers.name}`;
		}
	}

	console.log("Config sanitized", answers);
};

export default {
	description: "Generate a new package starter",
	prompts: [
		{
			type: "list",
			name: "type",
			message: "Choose a package type:",
			choices: [
				{
					name: "Library",
					checked: true,
					value: "libraries",
				},
				{
					name: "Internal",
					value: "internal",
				},
			],
		},
		{
			type: "input",
			name: "name",
			validate: (input) => !!input,
			message: `What is the name of the package? (You can skip the \`${PACKAGE_PREFIX}\` prefix)`,
		},
		{
			type: "input",
			name: "description",
			message: "What is the package about?",
		},
	],
	actions: (answers) => {
		sanitize(answers);

		return [
			{
				type: "addMany",
				base: "package/template",
				destination: "packages/{{type}}/{{rawName}}",
				templateFiles: "package/template/**/*",
			},
			{
				type: "add",
				path: "packages/{{type}}/{{rawName}}/src/{{rawName}}.test.ts",
				templateFile: "package/common/package.test.ts.hbs",
			},
		];
	},
} satisfies PlopTypes.PlopGeneratorConfig;
