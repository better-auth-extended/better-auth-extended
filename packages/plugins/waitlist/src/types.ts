import type { FieldAttribute } from "better-auth/db";
import type { GenericEndpointContext } from "better-auth/types";
import type { WaitlistUser } from "./schema";

type RequiredKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type WaitlistEndEvent =
	| "max-signups-reached"
	| "date-reached"
	| "date-reached-lottery"
	| "trigger";

interface WaitlistEndConfig_base {
	event: WaitlistEndEvent;
	onTrigger?: () => void;
}

interface WaitlistEndConfig_baseBounded extends WaitlistEndConfig_base {
	maximumWaitlistParticipants?: number | null;
}

interface WaitlistEndConfig_maxSignups
	extends RequiredKey<
		WaitlistEndConfig_baseBounded,
		"maximumWaitlistParticipants"
	> {
	event: "max-signups-reached";
}

interface WaitlistEndConfig_date extends WaitlistEndConfig_baseBounded {
	event: "date-reached";
	date: Date;
}

interface WaitlistEndConfig_dateLottery extends WaitlistEndConfig_base {
	event: "date-reached-lottery";
	// TODO: add config to select random participants
}

interface WaitlistEndConfig_trigger extends WaitlistEndConfig_baseBounded {
	event: "trigger";
}

export type WaitlistEndConfig =
	| WaitlistEndConfig_maxSignups
	| WaitlistEndConfig_date
	| WaitlistEndConfig_dateLottery
	| WaitlistEndConfig_trigger;

interface WaitlistOptions_base {
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
		waitlistUser?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<WaitlistUser, "id">]?: string;
			};
			/**
			 * Add extra waitlist columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
	};
}

interface WaitlistOptions_enabled extends WaitlistOptions_base {
	enabled: true | ((ctx: GenericEndpointContext) => Promise<boolean> | boolean);
	waitlistEndConfig:
		| WaitlistEndConfig
		| ((
				ctx: GenericEndpointContext,
		  ) => Promise<WaitlistEndConfig> | WaitlistEndConfig);
}

interface WaitlistOptions_disabled extends WaitlistOptions_base {
	enabled: false;
	waitlistEndConfig?:
		| WaitlistEndConfig
		| ((
				ctx: GenericEndpointContext,
		  ) => Promise<WaitlistEndConfig> | WaitlistEndConfig);
}

export type WaitlistOptions =
	| WaitlistOptions_enabled
	| WaitlistOptions_disabled;
