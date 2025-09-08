import { createAuthEndpoint } from "better-auth/plugins";
import type { LiteralString } from "better-auth";
import { getHelpDeskAdapter } from "../adapter";
import type { HelpDeskOptions } from "../types";
import { checkPermission, type AdditionalHelpDeskFields } from "../utils";
import z from "zod";
import { toZodSchema } from "better-auth/db";
import type { IsExactlyEmptyObject } from "@better-auth-extended/internal-utils";

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
					.enum([...(options.draftStatus ?? []), ...(options.openStatus ?? [])])
					.optional(),
				assigneeId: z.string().nullish(),
				parentIssueId: z.string().nullish(),
				subIssueId: z.string().nullish(),
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
						parentIssueId?: string | null;
						subIssueId?: string | null;
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

			// TODO: Check whether user can set assignee
			// TODO: Check whether user can lock conversation
			// TODO: Check whether user can set parent-/sub-issue

			const { additionalFields: additionalData, ...data } = ctx.body;
			const ticket = await adapter.createTicket<
				typeof additionalFields.ticket.$ReturnAdditionalFields
			>({
				...data,
				description: data.description as string | undefined | null,
				status:
					data.status ??
					(options.openStatus?.length && options.openStatus.length > 0
						? options.openStatus[0]
						: "open"),
				...(additionalData ?? {}),
			});

			// TODO: Add participant

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
				throw ctx.error("UNPROCESSABLE_ENTITY", {
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

			// TODO: Get ticket participants

			// TODO: After Hooks

			return {
				ticket,
				totalActivities,
				activities,
				participants: [],
			};
		},
	);
};
