import { z } from "zod";
import type { AppInviteOptions } from "../types";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { getAppInviteAdapter } from "../adapter";
import type { Where } from "better-auth";
import type { getAdditionalFields } from "../utils";

export const listAppInvitations = <
	O extends AppInviteOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields }: A,
) => {
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/list-invitations",
		{
			method: "GET",
			use: [sessionMiddleware],
			query: z.object({
				searchValue: z
					.string()
					.meta({
						description: "The value to search for",
					})
					.optional(),
				searchField: z
					.enum(["name", "email", "domainWhitelist"])
					.meta({
						description:
							"The field to search in, defaults to email. Can be `email`, `name` or `domainWhitelist`",
					})
					.optional(),
				searchOperator: z
					.enum(["contains", "starts_with", "ends_with"])
					.meta({
						description:
							"The operator to use for the search. Can be `contains`, `starts_with` or `ends_with`",
					})
					.optional(),
				limit: z.coerce
					.number()
					.meta({
						description: "The numbers of invitations to return",
					})
					.optional(),
				offset: z.coerce
					.number()
					.meta({
						description: "The offset to start from",
					})
					.optional(),
				sortBy: z
					.string()
					.meta({
						description: "The field to sort by",
					})
					.optional(),
				sortDirection: z
					.enum(["asc", "desc"])
					.meta({
						description: "The direction to sort by",
					})
					.optional(),
				filterField: z
					.string()
					.meta({
						description: "The field to filter by",
					})
					.optional(),
				filterValue: z
					.string()
					.or(z.number())
					.or(z.boolean())
					.meta({
						description: "The value to filter by",
					})
					.optional(),
				filterOperator: z
					.enum(["eq", "ne", "lt", "lte", "gt", "gte"])
					.meta({
						description: "The operator to use for the filter",
					})
					.optional(),
			}),
			metadata: {
				openapi: {
					operationId: "listAppInvitations",
					summary: "List issued invitations",
					description: "List issued invitations",
					responses: {
						200: {
							description: "List of issued invitations",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											invitations: {
												type: "array",
												items: {
													$ref: "#/components/schemas/AppInvitation",
												},
											},
											total: {
												type: "number",
											},
											limit: {
												type: ["number", "undefined"],
											},
											offset: {
												type: ["number", "undefined"],
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const where: Where[] = [
				{
					field: "inviterId",
					value: ctx.context.session.user.id,
				},
			];

			if (ctx.query?.searchValue) {
				where.push({
					field: ctx.query.searchField || "email",
					operator: ctx.query.searchOperator || "contains",
					value: ctx.query.searchValue,
				});
			}

			if (ctx.query?.filterValue && ctx.query.filterField !== "inviterId") {
				where.push({
					field: ctx.query.filterField || "email",
					operator: ctx.query.filterOperator || "eq",
					value: ctx.query.filterValue,
				});
			}

			const adapter = await getAppInviteAdapter(ctx.context, options);

			try {
				const limit = Number(ctx.query?.limit) || undefined;
				const offset = Number(ctx.query?.offset) || undefined;

				const total = await adapter.countInvitations({ where });

				const invitations =
					await adapter.listInvitations<ReturnAdditionalFields>({
						where,
						limit: ctx.query.limit,
						offset: ctx.query.offset,
						sortBy: ctx.query.sortBy
							? {
									field: ctx.query.sortBy,
									direction: ctx.query.sortDirection || "asc",
								}
							: undefined,
					});

				return ctx.json({
					total,
					invitations,
					limit,
					offset,
				});
			} catch (e) {
				return ctx.json({
					total: 0,
					invitations: [],
				});
			}
		},
	);
};
