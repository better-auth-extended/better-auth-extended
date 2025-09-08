import type { FieldAttribute } from "better-auth/db";
import type { DefaultActivityType } from "./schema";
import type { GenericEndpointContext, LiteralString } from "better-auth";

type Permission = {
	statement: string;
	permissions: string[];
};

export type HelpDeskOptions = {
	canCreateTicket:
		| ((
				ctx: GenericEndpointContext,
		  ) => Promise<boolean> | boolean | Promise<Permission> | Permission)
		| boolean
		| Permission;
	canGetTicket?:
		| ((
				ctx: GenericEndpointContext,
		  ) => Promise<boolean> | boolean | Promise<Permission> | Permission)
		| boolean
		| Permission;
	/**
	 * @default ["draft"]
	 */
	draftStatus?: [LiteralString, ...LiteralString[]];
	/**
	 * @default ["open"]
	 */
	openStatus?: [LiteralString, ...LiteralString[]];
	/**
	 * @default ["completed"]
	 */
	completedStatus?: [LiteralString, ...LiteralString[]];
	/**
	 * @default ["closed-not-planned", "closed-stale"]
	 */
	closedStatus?: [LiteralString, ...LiteralString[]];
	activityTypeMap?: {
		[key in DefaultActivityType]?: LiteralString;
	};
	schema?: {
		ticket?: {
			modelName?: string;
			fields?: {
				// TODO:
			};
			/**
			 * Add extra ticket columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketReaction?: {
			modelName?: string;
			fields?: {
				// TODO:
			};
			/**
			 * Add extra ticket reaction columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketLabel?: {
			modelName?: string;
			fields?: {
				// TODO:
			};
			/**
			 * Add extra ticket label columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketActivity?: {
			modelName?: string;
			fields?: {
				// TODO:
			};
			/**
			 * Add extra ticket activity columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
	};
};

export type * from "better-call";
