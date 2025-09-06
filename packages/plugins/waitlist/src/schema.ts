import { generateId, type AuthPluginSchema } from "better-auth";
import { z } from "zod";

type Mutable<T> = {
	-readonly [K in keyof T]: T[K];
};

const _waitlistEndEvent = [
	"max-signups-reached",
	"date-reached",
	"date-reached-lottery",
	"trigger",
] as const;

export const waitlistEndEvent = _waitlistEndEvent as Mutable<
	typeof _waitlistEndEvent
>;

export const schema = {
	waitlist: {
		fields: {
			endEvent: {
				type: waitlistEndEvent,
				required: true,
			},
			maxParticipants: {
				type: "number",
				required: false,
			},
			beginsAt: {
				type: "date",
				required: true,
				defaultValue: () => new Date(),
			},
			endsAt: {
				type: "date",
				required: false,
			},
		},
	},
	waitlistUser: {
		fields: {
			waitlistId: {
				type: "string",
				required: true,
				references: {
					model: "waitlist",
					field: "id",
				},
			},
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
				defaultValue: () => new Date(),
			},
			leftAt: {
				type: "date",
				required: false,
				input: false,
			},
		},
	},
} satisfies AuthPluginSchema;

export const waitlistSchema = z.object({
	id: z.string().default(generateId),
	endEvent: z.enum(waitlistEndEvent),
	maxParticipants: z.number().optional(),
	beginsAt: z.date().default(() => new Date()),
	endsAt: z.date().optional(),
});

export type Waitlist = z.infer<typeof waitlistSchema>;
export type WaitlistInput = z.input<typeof waitlistSchema>;

export const waitlistUserSchema = z.object({
	id: z.string().default(generateId),
	name: z.string(),
	email: z.email(),
	joinedAt: z.date().default(() => new Date()),
	leftAt: z.date().optional(),
});

export type WaitlistUser = z.infer<typeof waitlistUserSchema>;
export type WaitlistUserInput = z.input<typeof waitlistUserSchema>;
