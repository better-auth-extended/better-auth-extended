import type { CreateWaitlist, WaitlistOptions } from "../types";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import z from "zod";
import type { AdminPlugin, getAdditionalFields } from "../utils";
import { createWaitlistSchema, type CreateWaitlistOutput } from "../schema";
import { toZodSchema } from "better-auth/db";
import {
	getPlugin,
	tryCatch,
	type IsExactlyEmptyObject,
} from "@better-auth-extended/internal-utils";
import { getWaitlistAdapter } from "../adapter";
import type { Where } from "better-auth/types";

export const createWaitlist = <
	O extends WaitlistOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields, $AdditionalFields }: A,
) => {
	type AdditionalFields = typeof $AdditionalFields;
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/waitlist/create",
		{
			method: "POST",
			body: createWaitlistSchema.and(
				z.object({
					additionalFields: z
						.object({
							...(options.schema?.waitlist?.additionalFields
								? toZodSchema({
										fields: options.schema.waitlist.additionalFields,
										isClientSide: true,
									}).shape
								: {}),
						})
						.optional(),
				}),
			),
			use: [sessionMiddleware],
			metadata: {
				$Infer: {
					body: {} as CreateWaitlist &
						(IsExactlyEmptyObject<AdditionalFields> extends true
							? { additionalFields?: {} }
							: { additionalFields: AdditionalFields }),
				},
			},
		},
		async (ctx) => {
			const session = ctx.context.session;
			const body = ctx.body as CreateWaitlistOutput & {
				additonalFields?: Record<string, any>;
			};

			let canAccess = false;
			if (typeof options.canCreateWaitlist === "function") {
				canAccess = await options.canCreateWaitlist(ctx);
			} else {
				const adminPlugin = getPlugin<AdminPlugin>(
					"admin" satisfies AdminPlugin["id"],
					ctx.context,
				);

				if (!adminPlugin) {
					throw ctx.error("FAILED_DEPENDENCY", {
						// TODO: Error codes
						message: "",
					});
				}

				const res = await tryCatch(
					adminPlugin.endpoints.userHasPermission({
						...ctx,
						body: {
							role: session.user.role,
							permissions: {
								[options.canCreateWaitlist.statement]: [
									options.canCreateWaitlist.permission,
								],
							},
						},
						returnHeaders: true,
					}),
				);
				canAccess = (await res.data?.response.success) ?? false;
			}
			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			const adapter = getWaitlistAdapter(ctx.context, options);

			await options?.hooks?.waitlist?.create?.before?.(ctx);

			if (!options?.concurrent) {
				const where: Where[] = [
					{
						field: "beginsAt",
						value: body.beginsAt ?? new Date(),
						operator: "gte",
					},
					{
						field: "endsAt",
						value: null,
						connector: "OR",
					},
				];

				if (body.endsAt) {
					where.push({
						field: "endsAt",
						value: body.endsAt,
						operator: "lte",
						connector: "OR",
					});
				}

				const exists =
					(await ctx.context.adapter.count({
						model: "waitlist",
						where,
					})) > 0;

				if (exists) {
					throw ctx.error("BAD_REQUEST", {
						// TODO: Error codes
						message: "",
					});
				}
			}

			const waitlist = await adapter.createWaitlist<ReturnAdditionalFields>({
				...body,
				maxParticipants: body.maxParticipants ?? undefined,
			});

			await options?.hooks?.waitlist?.create?.after?.(ctx, waitlist);

			return waitlist;
		},
	);
};
