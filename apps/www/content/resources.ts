import { Categories } from "./categories";

export const resources = [
	{
		name: "app-invite",
		description: "Invite users to your application and allow them to sign up.",
		dateAdded: new Date(),
		author: "jslno",
		category: "plugins",
		url: "/docs/plugins/app-invite",
	},
	{
		name: "onboarding",
		description: "Easily add onboarding to your authentication flow.",
		dateAdded: new Date(),
		author: "jslno",
		category: "plugins",
		url: "/docs/plugins/onboarding",
	},
	{
		name: "test-utils",
		description:
			"A collection of utilities to help you test your Better-Auth plugins.",
		dateAdded: new Date(),
		author: "jslno",
		category: "libraries",
		url: "/docs/libraries/test-utils",
		isNew: true,
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
