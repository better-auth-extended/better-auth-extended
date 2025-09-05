import type { AuthPluginSchema } from "better-auth";

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
} satisfies AuthPluginSchema;
