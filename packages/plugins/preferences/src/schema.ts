import { generateId, type AuthPluginSchema } from "better-auth";
import { z } from "zod";

export const preferenceSchema = z.object({
	id: z.string().default(generateId),
	userId: z.string().nullish(),
	scopeId: z.string().nullish(),
	scope: z.string(),
	key: z.string(),
	value: z.string(),
	updatedAt: z.date().default(() => new Date()),
});
export type Preference = z.infer<typeof preferenceSchema>;
export type PreferenceInput = z.input<typeof preferenceSchema>;

export const schema = {
	preference: {
		fields: {
			userId: {
				type: "string",
				required: false,
				references: {
					model: "user",
					field: "id",
				},
			},
			scopeId: {
				type: "string",
				required: false,
			},
			scope: {
				type: "string",
			},
			key: {
				type: "string",
			},
			value: {
				type: "string",
				sortable: true,
			},
			updatedAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: () => new Date(),
				onUpdate: () => new Date(),
			},
		},
	},
} satisfies AuthPluginSchema;
