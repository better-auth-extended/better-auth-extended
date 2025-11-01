import type { BetterAuthPluginDBSchema } from "better-auth/db";

export const schema = {
	user: {
		fields: {
			shouldOnboard: {
				type: "boolean",
				required: false,
			},
			completedSteps: {
				type: "string",
				required: false,
				input: false,
			},
		},
	},
} satisfies BetterAuthPluginDBSchema;
