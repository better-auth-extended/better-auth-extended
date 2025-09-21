import { Categories } from "./categories";

export const resources = [
	{
		name: "app-invite",
		description: "Invite users to your application and allow them to sign up.",
		dateAdded: new Date("2025-09-03"),
		author: "jslno",
		category: "plugins",
		url: "/docs/plugins/app-invite",
	},
	{
		name: "onboarding",
		description: "Easily add onboarding to your authentication flow.",
		dateAdded: new Date("2025-09-04"),
		author: "jslno",
		category: "plugins",
		url: "/docs/plugins/onboarding",
	},
	{
		name: "preferences",
		description:
			"Define and manage preferences, with support for scoped settings.",
		// TODO:
		dateAdded: new Date(),
		author: "jslno",
		category: "plugins",
		url: "/docs/plugins/preferences",
		isNew: true,
	},
	{
		name: "test-utils",
		description:
			"A collection of utilities to help you test your Better-Auth plugins.",
		dateAdded: new Date("2025-09-03"),
		author: "jslno",
		category: "libraries",
		url: "/docs/libraries/test-utils",
	},
] satisfies Resource[];

export type Resource = {
	name: string;
	description?: string;
	dateAdded: Date;
	author?: string | string[];
	category: Categories;
	url: string;
	isNew?: boolean;
};
