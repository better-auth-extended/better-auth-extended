import type { FieldAttribute } from "better-auth/db";
import type { Waitlist, waitlistEndEvent, WaitlistUser } from "./schema";

export type WaitlistEndEvent = (typeof waitlistEndEvent)[number];

export type { Waitlist, WaitlistUser } from "./schema";

interface CreateWaitlist_base {
	endEvent: WaitlistEndEvent;
	beginsAt?: Date;
	endsAt?: Date;
	maxParticipants?: number | null;
}

interface CreateWaitlist_maxSignups extends CreateWaitlist_base {
	endEvent: "max-signups-reached";
	maxParticipants: number;
}

interface CreateWaitlist_date extends CreateWaitlist_base {
	endEvent: "date-reached" | "date-reached-lottery";
	endsAt: Date;
}

interface CreateWaitlist_rest extends CreateWaitlist_base {
	endEvent: Exclude<
		WaitlistEndEvent,
		"max-signups-reached" | "date-reached" | "date-reached-lottery"
	>;
}

export type CreateWaitlist =
	| CreateWaitlist_maxSignups
	| CreateWaitlist_date
	| CreateWaitlist_rest;

export type WaitlistOptions = {
	/**
	 * Whether to disable sign in while the waitlist is active.
	 *
	 * @default false
	 */
	disableSignIn?: boolean;
	/**
	 * Whether to disable sign ups while the waitlist is active.
	 *
	 * @default false
	 */
	disableSignUp?: boolean;
	secondaryStorage?: boolean;
	schema?: {
		waitlist?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<Waitlist, "id">]?: string;
			};
			/**
			 * Add extra waitlist columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		waitlistUser?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<WaitlistUser, "id">]?: string;
			};
			/**
			 * Add extra waitlist user columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
	};
};

export type * from "better-call";
