import type { BetterAuthPlugin } from "better-auth";
import type { HelpDeskOptions } from "./types";
import { getAdditionalFields, getMergedSchema } from "./utils";
import { createHelpDeskTicket } from "./routes/crud-ticket";
import type {
	Ticket,
	TicketActivity,
	TicketLabel,
	TicketParticipant,
	TicketReaction,
} from "./schema";
// biome-ignore lint/correctness/noUnusedImports: fix type annotation
import * as z from "zod";

export const helpDesk = <O extends HelpDeskOptions>(options: O) => {
	const opts = {
		draftStatus: ["draft"],
		openStatus: ["open"],
		completedStatus: ["completed"],
		closedStatus: ["closed-not-planned", "closed-stale"],
		...options,
	} satisfies HelpDeskOptions;

	const additionalFields = getAdditionalFields(opts as O);

	const endpoints = {
		createHelpDeskTicket: createHelpDeskTicket(opts as O, additionalFields),
	};

	return {
		id: "help-desk",
		endpoints,
		schema: getMergedSchema(opts),
		options: opts,
		$Infer: {
			Ticket: {} as Ticket &
				typeof additionalFields.ticket.$ReturnAdditionalFields,
			TicketReaction: {} as TicketReaction,
			TicketLabel: {} as TicketLabel &
				typeof additionalFields.ticketLabel.$ReturnAdditionalFields,
			TicketParticipant: {} as TicketParticipant &
				typeof additionalFields.ticketParticipant.$ReturnAdditionalFields,
			TicketActivity: {} as TicketActivity &
				typeof additionalFields.ticketActivity.$ReturnAdditionalFields,
		},
		// TODO:
		$ERROR_CODES: {},
	} satisfies BetterAuthPlugin;
};

export * from "./types";
