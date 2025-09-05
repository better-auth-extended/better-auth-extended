import { generateId, type AuthPluginSchema } from "better-auth";
import { z } from "zod";

export const schema = {
	waitlistUser: {
		fields: {
			email: {
				type: "string",
				required: true,
				input: true,
				unique: true,
			},
			name: {
				type: "string",
				required: true,
				input: true,
			},
			joinedAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: new Date(),
			},
		},
	},
} satisfies AuthPluginSchema;

export const waitlistUser = z.object({
	id: z.string().default(generateId),
	name: z.string(),
	email: z.email(),
	joinedAt: z.date().default(() => new Date()),
});

export type WaitlistUser = z.infer<typeof waitlistUser>;
export type WaitlistUserInput = z.input<typeof waitlistUser>;
