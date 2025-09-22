import type { AuthContext, TransactionAdapter } from "better-auth";
import type {
	TicketActivity,
	Ticket,
	TicketInput,
	TicketParticipantInput,
	TicketParticipant,
	TicketActivityInput,
} from "./schema";
import type { HelpDeskOptions } from "./types";

export const getHelpDeskAdapter = (
	context: AuthContext,
	options?: HelpDeskOptions,
) => {
	const adapter = context.adapter;

	const existsParticipant = async (
		ticketId: string,
		userId: string,
		trxAdapter?: TransactionAdapter,
	) => {
		return (
			(await (trxAdapter || adapter).count({
				model: "ticketParticipant",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
					{ field: "userId", value: userId },
				],
			})) > 0
		);
	};

	const updateParticipant = async <
		AdditionalFields extends Record<string, any>,
	>(
		ticketId: string,
		userId: string,
		update: Partial<Omit<TicketParticipantInput, "id">> & Record<string, any>,
		trxAdapter?: TransactionAdapter,
	) => {
		const participant = await (trxAdapter || adapter).update<
			TicketParticipant & AdditionalFields
		>({
			model: "ticketParticipant",
			where: [
				{
					field: "ticketId",
					value: ticketId,
				},
				{
					field: "userId",
					value: userId,
				},
			],
			update,
		});

		return participant;
	};

	const updateTicket = async <AdditionalFields extends Record<string, any>>(
		ticketId: string,
		update: Partial<Omit<TicketInput, "id">> & Record<string, any>,
		trxAdapter?: TransactionAdapter,
	) => {
		const ticket = await (trxAdapter || adapter).update<
			Ticket & AdditionalFields
		>({
			model: "ticket",
			where: [
				{
					field: "id",
					value: ticketId,
				},
			],
			update,
		});

		return ticket;
	};

	return {
		createTicket: async <AdditionalFields extends Record<string, any>>(
			data: Omit<TicketInput, "id"> & Record<string, any>,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).create<
				TicketInput,
				Ticket & AdditionalFields
			>({
				model: "ticket",
				data,
			});
		},
		findTicketById: async <AdditionalFields extends Record<string, any>>(
			id: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).findOne<Ticket & AdditionalFields>({
				model: "ticket",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
		},
		updateTicket,
		listTicketActivities: async <AdditionalFields extends Record<string, any>>(
			ticketId: string,
			options?: {
				limit?: number;
				offset?: number;
			},
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).findMany<
				TicketActivity & AdditionalFields
			>({
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
		countTotalTicketActivities: async (
			ticketId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).count({
				model: "ticketActivitiy",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
		existsParticipant,
		updateParticipant,
		findParticipant: async <AdditionalFields extends Record<string, any>>(
			ticketId: string,
			userId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			const participant = await (trxAdapter || adapter).findOne<
				TicketParticipant & AdditionalFields
			>({
				model: "ticketParticipant",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
					{
						field: "userId",
						value: userId,
					},
				],
			});

			return participant;
		},
		addParticipant: async (
			ticketId: string,
			userId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			if (await existsParticipant(ticketId, userId, trxAdapter)) {
				return updateParticipant(
					ticketId,
					userId,
					{
						lastSeenAt: new Date(),
					},
					trxAdapter,
				);
			}

			return (trxAdapter || adapter).create<
				TicketParticipantInput,
				TicketParticipant
			>({
				model: "ticketParticipant",
				data: {
					ticketId,
					userId,
				},
			});
		},
		deleteTicket: async (ticketId: string, trxAdapter?: TransactionAdapter) => {
			await (trxAdapter || adapter).delete({
				model: "ticket",
				where: [
					{
						field: "id",
						value: ticketId,
					},
				],
			});
		},
		deleteTicketLabels: async (
			ticketId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).deleteMany({
				model: "ticketLabel",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
		deleteTicketReactions: async (
			ticketId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).deleteMany({
				model: "ticketReaction",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
		deleteTicketActivities: async (
			ticketId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).deleteMany({
				model: "ticketActivity",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
		deleteTicketParticipants: async (
			ticketId: string,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).deleteMany({
				model: "ticketParticipant",
				where: [
					{
						field: "ticketId",
						value: ticketId,
					},
				],
			});
		},
		createTicketActivity: async <AdditionalFields extends Record<string, any>>(
			data: Omit<TicketActivityInput, "id"> & Record<string, any>,
			trxAdapter?: TransactionAdapter,
		) => {
			return (trxAdapter || adapter).create<
				TicketActivityInput & Record<string, any>,
				TicketActivity & AdditionalFields
			>({
				model: "ticketActivity",
				data,
			});
		},
	};
};
