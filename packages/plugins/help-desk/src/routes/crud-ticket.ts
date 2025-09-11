import { createAuthEndpoint } from "better-auth/plugins";
import type { LiteralString } from "better-auth";
import { getHelpDeskAdapter } from "../adapter";
import type { HelpDeskOptions } from "../types";
import { checkPermission, type AdditionalHelpDeskFields } from "../utils";
import z from "zod";
import { toZodSchema } from "better-auth/db";
import type { IsExactlyEmptyObject } from "@better-auth-extended/internal-utils";

// TODO: Ticket activities

export const createHelpDeskTicket = <O extends HelpDeskOptions>(
	options: O,
	additionalFields: AdditionalHelpDeskFields<O>,
) => {
	type DraftStatus = O["draftStatus"] extends [
		LiteralString,
		...LiteralString[],
	]
		? O["draftStatus"][number]
		: "draft";
	type OpenStatus = O["openStatus"] extends [LiteralString, ...LiteralString[]]
		? O["openStatus"][number]
		: "open";

	return createAuthEndpoint(
		"/help-desk/create-ticket",
		{
			method: "POST",
			body: z.object({
				title: z.string(),
				description: z
					.json()
					.transform((json) => JSON.stringify(json))
					.nullish(),
				status: z
					.enum([
						...(options.draftStatus ?? ["draft"]),
						...(options.openStatus ?? ["open"]),
					])
					.optional(),
				assigneeId: z.string().nullish(),
				locked: z.boolean().optional(),
				additionalFields: z
					.object({
						...(options.schema?.ticket?.additionalFields
							? toZodSchema({
									fields: options.schema?.ticket?.additionalFields,
									isClientSide: true,
								}).shape
							: {}),
					})
					.optional(),
			}),
			metadata: {
				$Infer: {
					body: {} as {
						title: string;
						description?: z.core.util.JSONType | null;
						status?: DraftStatus | OpenStatus;
						assigneeId?: string | null;
						locked?: boolean;
					} & (IsExactlyEmptyObject<
						typeof additionalFields.ticket.$AdditionalFields
					> extends true
						? {
								additionalFields?: {};
							}
						: {
								additionalFields: typeof additionalFields.ticket.$AdditionalFields;
							}),
				},
			},
		},
		async (ctx) => {
			const canCreateTicket =
				typeof options.canCreateTicket === "function"
					? await options.canCreateTicket(ctx)
					: options.canCreateTicket;
			const canAccess =
				typeof canCreateTicket === "object"
					? await checkPermission(ctx, {
							[canCreateTicket.statement]: canCreateTicket.permissions,
						})
					: canCreateTicket;
			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			const adapter = getHelpDeskAdapter(ctx.context, options);

			// TODO: Before hook

			const { additionalFields: additionalData, ...data } = ctx.body;

			if (data.locked) {
				const canLockConversation =
					typeof options.canLockConversation === "function"
						? await options.canLockConversation(ctx)
						: options.canLockConversation;
				const canLock =
					typeof canLockConversation === "object"
						? await checkPermission(ctx, {
								[canLockConversation.statement]:
									canLockConversation.permissions,
							})
						: canLockConversation;

				if (!canLock) {
					throw ctx.error("FORBIDDEN", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			if (data.assigneeId) {
				const canSetAssignee =
					typeof options.canSetAssignee === "function"
						? await options.canSetAssignee(ctx, data.assigneeId)
						: options.canSetAssignee;
				const canAssign =
					typeof canSetAssignee === "object"
						? await checkPermission(ctx, {
								[canSetAssignee.statement]: canSetAssignee.permissions,
							})
						: canSetAssignee;
				if (!canAssign) {
					throw ctx.error("FORBIDDEN", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			const ticket = await ctx.context.adapter.transaction(
				async (trxAdapter) => {
					const ticket = await adapter.createTicket<
						typeof additionalFields.ticket.$ReturnAdditionalFields
					>(
						{
							...data,
							authorId: ctx.context.session?.user.id,
							description: data.description as string | undefined | null,
							status:
								data.status ??
								(options.openStatus?.length && options.openStatus.length > 0
									? options.openStatus[0]
									: "open"),
							...(additionalData ?? {}),
						},
						trxAdapter,
					);

					if (!ticket) {
						throw ctx.error("BAD_REQUEST", {});
					}

					if (ctx.context.session) {
						await adapter.addParticipant(
							ticket.id,
							ctx.context.session.user.id,
							trxAdapter,
						);
					}

					return ticket;
				},
			);

			// TODO: After hook

			return ticket;
		},
	);
};

export const getHelpDeskTicket = <O extends HelpDeskOptions>(
	options: O,
	additionalFields: AdditionalHelpDeskFields<O>,
) => {
	return createAuthEndpoint(
		"/help-desk/get-ticket",
		{
			method: "GET",
			query: z.object({
				id: z.string(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			}),
		},
		async (ctx) => {
			const canGetTicket =
				typeof options.canGetTicket === "function"
					? await options.canGetTicket(ctx)
					: (options.canGetTicket ?? true);
			const canAccess =
				typeof canGetTicket === "object"
					? await checkPermission(ctx, {
							[canGetTicket.statement]: canGetTicket.permissions,
						})
					: canGetTicket;
			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			const adapter = getHelpDeskAdapter(ctx.context, options);

			// TODO: Before Hooks

			const ticket = await adapter.findTicketById<
				typeof additionalFields.ticket.$ReturnAdditionalFields
			>(ctx.query.id);

			if (!ticket) {
				throw ctx.error("BAD_REQUEST", {
					// TODO: Error codes
					message: "",
				});
			}

			const totalActivities = await adapter.countTotalTicketActivities(
				ticket.id,
			);

			const activities = await adapter.listTicketActivities<
				typeof additionalFields.ticketActivity.$ReturnAdditionalFields
			>(ticket.id, {
				limit: ctx.query.limit,
				offset: ctx.query.offset,
			});

			if (
				ctx.context.session?.user &&
				(await adapter.existsParticipant(
					ticket.id,
					ctx.context.session.user.id,
				))
			) {
				await adapter.updateParticipant(
					ticket.id,
					ctx.context.session.user.id,
					{
						lastSeenAt: new Date(),
					},
				);
			}

			// TODO: After Hooks

			return {
				ticket,
				totalActivities,
				activities,
			};
		},
	);
};

export const updateHelpDeskTicket = <O extends HelpDeskOptions>(
	options: O,
	additionalFields: AdditionalHelpDeskFields<O>,
) => {
	type OpenStatus = O["openStatus"] extends [LiteralString, ...LiteralString[]]
		? O["openStatus"][number]
		: "open";
	type CompletedStatus = O["completedStatus"] extends [
		LiteralString,
		...LiteralString[],
	]
		? O["completedStatus"][number]
		: "completed";
	type ClosedStatus = O["closedStatus"] extends [
		LiteralString,
		...LiteralString[],
	]
		? O["closedStatus"][number]
		: "closed-not-planned" | "closed-stale";

	return createAuthEndpoint(
		"/help-desk/update-ticket",
		{
			method: "POST",
			body: z.object({
				ticketId: z.string().nonempty(),
				data: z.object({
					title: z.string().optional(),
					description: z
						.json()
						.transform((json) => JSON.stringify(json))
						.nullish(),
					status: z
						.enum([
							...(options.openStatus ?? ["draft"]),
							...(options.completedStatus ?? ["completed"]),
							...(options.closedStatus ?? [
								"closed-not-planned",
								"closed-stale",
							]),
						])
						.optional(),
					assigneeId: z.string().nullish(),
					locked: z.boolean().optional(),
					additionalFields: z
						.object({
							...(options.schema?.ticket?.additionalFields
								? toZodSchema({
										fields: options.schema?.ticket?.additionalFields,
										isClientSide: true,
									}).shape
								: {}),
						})
						.optional(),
				}),
			}),
			metadata: {
				$Infer: {
					body: {} as {
						ticketId: string;
						data: {
							title?: string;
							description?: z.core.util.JSONType | null;
							status?: OpenStatus | CompletedStatus | ClosedStatus;
							assigneeId?: string | null;
							locked?: boolean;
						} & (IsExactlyEmptyObject<
							typeof additionalFields.ticket.$AdditionalFields
						> extends true
							? {
									additionalFields?: {};
								}
							: {
									additionalFields: typeof additionalFields.ticket.$AdditionalFields;
								});
					},
				},
			},
		},
		async (ctx) => {
			const canUpdateTicket =
				typeof options.canUpdateTicket === "function"
					? await options.canUpdateTicket(ctx)
					: options.canUpdateTicket;
			const canAccess =
				typeof canUpdateTicket === "object"
					? await checkPermission(ctx, {
							[canUpdateTicket.statement]: canUpdateTicket.permissions,
						})
					: canUpdateTicket;
			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			const adapter = getHelpDeskAdapter(ctx.context, options);

			// TODO: Before hooks

			const { additionalFields: additionalData, ...data } = ctx.body.data;

			if (data.assigneeId) {
				const canSetAssignee =
					typeof options.canSetAssignee === "function"
						? await options.canSetAssignee(ctx, data.assigneeId)
						: options.canSetAssignee;
				const canAssign =
					typeof canSetAssignee === "object"
						? await checkPermission(ctx, {
								[canSetAssignee.statement]: canSetAssignee.permissions,
							})
						: canSetAssignee;
				if (!canAssign) {
					throw ctx.error("FORBIDDEN", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			if (data.locked !== undefined) {
				const canLockConversation =
					typeof options.canLockConversation === "function"
						? await options.canLockConversation(ctx)
						: options.canLockConversation;
				const canLock =
					typeof canLockConversation === "object"
						? await checkPermission(ctx, {
								[canLockConversation.statement]:
									canLockConversation.permissions,
							})
						: canLockConversation;

				if (!canLock) {
					throw ctx.error("FORBIDDEN", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			if (data.status) {
				const ticket = await ctx.context.adapter.findOne<{ status: string }>({
					model: "ticket",
					where: [
						{
							field: "id",
							value: ctx.body.ticketId,
						},
					],
					select: ["status"],
				});

				if (!ticket?.status) {
					throw ctx.error("BAD_REQUEST", {
						// TODO: Error codes
						message: "",
					});
				}

				const canChangeStatus =
					typeof options.canChangeTicketStatus === "function"
						? await options.canChangeTicketStatus(ctx, {
								prev: ticket.status,
								next: data.status,
							})
						: options.canChangeTicketStatus;
				const canChange =
					typeof canChangeStatus === "object"
						? await checkPermission(ctx, {
								[canChangeStatus.statement]: canChangeStatus.permissions,
							})
						: canChangeStatus;

				if (!canChange) {
					throw ctx.error("FORBIDDEN", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			const ticket = await ctx.context.adapter.transaction(
				async (trxAdapter) => {
					const ticket = await adapter.updateTicket<
						typeof additionalFields.ticket.$ReturnAdditionalFields
					>(
						ctx.body.ticketId,
						{
							...data,
							description: data.description as string | null | undefined,
							...additionalData,
						},
						trxAdapter,
					);

					if (!ticket) {
						throw ctx.error("BAD_REQUEST", {
							// TODO: Error codes
							message: "",
						});
					}

					if (ctx.context.session?.user) {
						await adapter.addParticipant(
							ticket.id,
							ctx.context.session.user.id,
							trxAdapter,
						);
					}

					return ticket;
				},
			);

			// TODO: After hooks

			return ticket;
		},
	);
};

export const deleteHelpDeskTicket = <O extends HelpDeskOptions>(options: O) => {
	return createAuthEndpoint(
		"/help-desk/delete-ticket",
		{
			method: "POST",
			body: z.object({
				ticketId: z.string().nonempty(),
			}),
		},
		async (ctx) => {
			const canDeleteTicket =
				typeof options.canDeleteTicket === "function"
					? await options.canDeleteTicket(ctx)
					: options.canDeleteTicket;
			const canAccess =
				typeof canDeleteTicket === "object"
					? await checkPermission(ctx, {
							[canDeleteTicket.statement]: canDeleteTicket.permissions,
						})
					: canDeleteTicket;
			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			// TODO: Before hooks

			const adapter = getHelpDeskAdapter(ctx.context, options);

			await ctx.context.adapter.transaction(async (trxAdapter) => {
				await Promise.all([
					adapter.deleteTicketReactions(ctx.body.ticketId, trxAdapter),
					adapter.deleteTicketLabels(ctx.body.ticketId, trxAdapter),
					adapter.deleteTicketActivities(ctx.body.ticketId, trxAdapter),
					adapter.deleteTicketParticipants(ctx.body.ticketId, trxAdapter),
				]);
				await adapter.deleteTicket(ctx.body.ticketId, trxAdapter);
			});

			// TODO: After hooks
		},
	);
};
