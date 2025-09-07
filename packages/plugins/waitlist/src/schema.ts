import {
	generateId,
	type AuthPluginSchema,
	type UnionToIntersection,
} from "better-auth";
import { z } from "zod";
import type { WaitlistEndEvent } from "./types";

type Mutable<T> = {
	-readonly [K in keyof T]: T[K];
};

type LastOf<T> = UnionToIntersection<
	T extends any ? (x: T) => void : never
> extends (x: infer R) => void
	? R
	: never;

type UnionToTuple<T, L = LastOf<T>> = [T] extends [never]
	? []
	: [...UnionToTuple<Exclude<T, L>>, L];

const _waitlistEndEvent = [
	"max-signups-reached",
	"date-reached",
	"date-reached-lottery",
	"trigger",
] as const;

export const waitlistEndEvent = _waitlistEndEvent as Mutable<
	typeof _waitlistEndEvent
>;

const dateSchema = z.coerce.date<string | Date>();
const createWaitlistBaseConfigSchema = z.object({
	endEvent: z.enum(waitlistEndEvent),
	beginsAt: dateSchema.default(() => new Date()),
	endsAt: dateSchema.optional(),
	maxParticipants: z.number().nullish(),
});

const configs = [
	createWaitlistBaseConfigSchema.extend({
		endEvent: z.literal("max-signups-reached"),
		maxParticipants: z.number(),
	}),
	createWaitlistBaseConfigSchema.extend({
		endEvent: z.literal("date-reached"),
		endsAt: dateSchema,
	}),
	createWaitlistBaseConfigSchema.extend({
		endEvent: z.literal("date-reached-lottery"),
		endsAt: dateSchema,
	}),
	createWaitlistBaseConfigSchema.extend({
		endEvent: z.literal("trigger"),
	}),
] as const satisfies UnionToTuple<WaitlistEndEvent> extends infer Tup
	? {
			[I in keyof Tup]: z.ZodObject<{
				endEvent: z.ZodLiteral<Extract<Tup[I], string>>;
			}>;
		}
	: never;
export const createWaitlistSchema = z.discriminatedUnion("endEvent", configs);

export type CreateWaitlist = z.input<typeof createWaitlistSchema>;
export type CreateWaitlistOutput = z.infer<typeof createWaitlistSchema>;

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
