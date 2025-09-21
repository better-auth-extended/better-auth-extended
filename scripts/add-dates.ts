import { Project, SyntaxKind } from "ts-morph";
import { Biome } from "@biomejs/js-api/nodejs";
import { writeFile } from "node:fs/promises";

const RESOURCES_PATH = "./apps/www/content/resources.ts";
const TSCONFIG_PATH = "./apps/www/tsconfig.json";

const main = async () => {
	const project = new Project({
		tsConfigFilePath: TSCONFIG_PATH,
		skipAddingFilesFromTsConfig: true,
	});

	project.addSourceFileAtPath(RESOURCES_PATH);

	const sourceFile = project.getSourceFileOrThrow(RESOURCES_PATH);

	const variable = sourceFile.getVariableDeclarationOrThrow("resources");

	const initializer = variable.getInitializerOrThrow();

	if (initializer.getKind() === SyntaxKind.ArrayLiteralExpression) {
		const arrayLiteral = initializer.asKindOrThrow(
			SyntaxKind.ArrayLiteralExpression,
		);

		const elements = arrayLiteral.getElements();
		elements.forEach((el, i) => {
			if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
				const obj = el.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

				const dateProp = obj.getProperty("dateAdded");

				if (!dateProp) {
					obj.addPropertyAssignment({
						name: "dateAdded",
						initializer: `new Date("${new Date().toISOString()}")`,
					});
				} else {
					if (dateProp.getKind() === SyntaxKind.PropertyAssignment) {
						const propAssignment = dateProp.asKindOrThrow(
							SyntaxKind.PropertyAssignment,
						);
						const init = propAssignment.getInitializer();

						if (
							!init ||
							init.getText().match(/^new Date\(\s*\)$/) ||
							init.getText() === "undefined"
						) {
							propAssignment.setInitializer(
								`new Date("${new Date().toISOString()}")`,
							);
						}
					}
				}
			}
		});
	}

	const biome = new Biome();
	const { projectKey } = biome.openProject(".");

	const formatted = biome.formatContent(projectKey, sourceFile.getFullText(), {
		filePath: RESOURCES_PATH,
	});

	await writeFile(RESOURCES_PATH, formatted.content, {
		encoding: "utf-8",
	});
};

void main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
