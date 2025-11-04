import { owner } from "@/lib/github";
import { Categories } from "./categories";

export const resources: Resource[] = [
	{
		name: "app-invite",
		description: "Invite users to your application and allow them to sign up.",
		dateAdded: new Date("2025-09-03"),
		author: owner,
		category: "plugins",
		url: "/docs/plugins/app-invite",
	},
	{
		name: "onboarding",
		description: "Easily add onboarding to your authentication flow.",
		dateAdded: new Date("2025-09-04"),
		author: owner,
		category: "plugins",
		url: "/docs/plugins/onboarding",
	},
	{
		name: "preferences",
		description:
			"Define and manage preferences, with support for scoped settings.",
		dateAdded: new Date("2025-09-23T02:40:49.474Z"),
		author: owner,
		category: "plugins",
		url: "/docs/plugins/preferences",
	},
	{
		name: "test-utils",
		description:
			"A collection of utilities to help you test your Better-Auth plugins.",
		dateAdded: new Date("2025-09-03"),
		author: owner,
		category: "libraries",
		url: "/docs/libraries/test-utils",
	},
	{
		name: "dashboard",
		description: "A Better-Auth powered admin dashboard.",
		author: owner,
		category: "libraries",
		url: "https://github.com/better-auth-extended/dashboard",
	},
];

export type Resource = {
	name: string;
	description?: string;
	dateAdded?: Date;
	author?: string | string[];
	category: Categories;
	url: string;
	isNew?: boolean;
};
