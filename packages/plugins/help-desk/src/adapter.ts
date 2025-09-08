import type { AuthContext } from "better-auth";
import type { TicketActivity, Ticket, TicketInput } from "./schema";
import type { HelpDeskOptions } from "./types";

export const getHelpDeskAdapter = (
	context: AuthContext,
	options?: HelpDeskOptions,
) => {
	const adapter = context.adapter;

	return {
		createTicket: async <AdditionalFields extends Record<string, any>>(
			data: Omit<TicketInput, "id"> & Record<string, any>,
		) => {
			return adapter.create<TicketInput, Ticket & AdditionalFields>({
				model: "ticket",
				data,
			});
		},
		findTicketById: async <AdditionalFields extends Record<string, any>>(
			id: string,
		) => {
			return adapter.findOne<Ticket & AdditionalFields>({
				model: "ticket",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
		},
		listTicketActivities: async <AdditionalFields extends Record<string, any>>(
			ticketId: string,
			options?: {
				limit?: number;
				offset?: number;
			},
		) => {
			return adapter.findMany<TicketActivity & AdditionalFields>({
				model: "ticketActivity",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
				sortBy: {
					field: "createdAt",
					direction: "asc",
				},
				...options,
			});
		},
		countTotalTicketActivities: async (ticketId: string) => {
			return adapter.count({
				model: "ticketActivitiy",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
	};
};
