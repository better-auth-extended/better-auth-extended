import type { FieldAttribute } from "better-auth/db";
import { waitlistEndEvent, type Waitlist, type WaitlistUser } from "./schema";
import type { GenericEndpointContext } from "better-auth";

export type WaitlistEndEvent = (typeof waitlistEndEvent)[number];

export type { Waitlist, CreateWaitlist, WaitlistUser } from "./schema";

export type WaitlistOptions = {
	canCreateWaitlist:
		| ((ctx: GenericEndpointContext) => Promise<boolean> | boolean)
		| {
				statement: string;
				permissions: string[];
		  };
	canGetWaitlist:
		| ((ctx: GenericEndpointContext) => Promise<boolean> | boolean)
		| {
				statement: string;
				permissions: string[];
		  };
	canAcceptUser:
		| ((ctx: GenericEndpointContext) => Promise<boolean> | boolean)
		| {
				statement: string;
				permissions: string[];
		  };
	canRejectUser:
		| ((ctx: GenericEndpointContext) => Promise<boolean> | boolean)
		| {
				statement: string;
				permissions: string[];
		  };
	concurrent?: boolean;
	/**
	 * Whether to disable sign in while the waitlist is active.
	 *
	 * @default false
	 */
	disableSignIn?: boolean;
	/**
	 * Whether to disable sign ups while the waitlist is active.
	 *
	 * @default true
	 */
	disableSignUp?: boolean;
	disableSessionMiddleware?: boolean;
	secondaryStorage?: boolean;
	hooks?: {
		waitlist?: {
			create?: {
				before?: (ctx: GenericEndpointContext) => Promise<void> | void;
				after?: (
					ctx: GenericEndpointContext,
					waitlist: Waitlist & Record<string, any>,
				) => Promise<void> | void;
			};
			get?: {
				before?: (ctx: GenericEndpointContext) => Promise<void> | void;
				after?: (
					ctx: GenericEndpointContext,
					waitlist: (Waitlist & Record<string, any>) | null,
				) => Promise<void> | void;
			};
		};
		waitlistUser?: {};
	};
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
