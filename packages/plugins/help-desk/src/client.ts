import type { BetterAuthClientPlugin } from "better-auth";
import type { helpDesk } from "./index";
import type { FieldAttribute } from "better-auth/db";
import type { HelpDeskOptions } from "./types";
import type { AdditionalHelpDeskFields } from "./utils";
import type {
	Ticket,
	TicketActivity,
	TicketParticipant,
	TicketLabel,
	TicketReaction,
} from "./schema";

export type HelpDeskClientOptions = {
	schema?: {
		ticket?: {
			/**
			 * Add extra ticket columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketReaction?: {
			/**
			 * Add extra ticket reaction columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketLabel?: {
			/**
			 * Add extra ticket label columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketComment?: {
			/**
			 * Add extra ticket comment columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
		ticketActivity?: {
			/**
			 * Add extra ticket activity columns.
			 */
			additionalFields?: {
				[key in string]: FieldAttribute;
			};
		};
	};
};

export const helpDeskClient = <O extends HelpDeskClientOptions>(
	options?: O,
) => {
	type AdditionalFields = AdditionalHelpDeskFields<HelpDeskOptions & O>;

	return {
		id: "help-desk",
		$InferServerPlugin: {} as ReturnType<typeof helpDesk<HelpDeskOptions & O>>,
		getActions: () => {
			return {
				$Infer: {
					Ticket: {} as Ticket &
						AdditionalFields["ticket"]["$ReturnAdditionalFields"],
					TicketReaction: {} as TicketReaction &
						AdditionalFields["ticketReaction"]["$ReturnAdditionalFields"],
					TicketParticipant: {} as TicketParticipant &
						AdditionalFields["ticketParticipant"]["$ReturnAdditionalFields"],
					TicketLabel: {} as TicketLabel &
						AdditionalFields["ticketLabel"]["$ReturnAdditionalFields"],
					TicketActivity: {} as TicketActivity &
						AdditionalFields["ticketActivity"]["$ReturnAdditionalFields"],
				},
			};
		},
	} satisfies BetterAuthClientPlugin;
};
