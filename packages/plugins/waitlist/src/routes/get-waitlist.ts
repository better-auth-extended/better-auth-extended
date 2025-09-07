import type { WaitlistOptions } from "../types";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import z from "zod";
import {
	checkPermission,
	conditionalMiddleware,
	type getAdditionalFields,
} from "../utils";
import { getWaitlistAdapter } from "../adapter";

export const getWaitlist = <
	O extends WaitlistOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields, $AdditionalFields }: A,
) => {
	type AdditionalFields = typeof $AdditionalFields;
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/waitlist/get-waitlist",
		{
			method: "GET",
			query: z.object({
				id: z.string(),
			}),
			use: [
				...conditionalMiddleware(
					!(options.disableSessionMiddleware ?? false),
					sessionMiddleware,
				),
			],
		},
		async (ctx) => {
			const canAccess =
				typeof options.canGetWaitlist === "function"
					? await options.canGetWaitlist(ctx)
					: await checkPermission(ctx, {
							[options.canGetWaitlist.statement]:
								options.canGetWaitlist.permissions,
						});

			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			const adapter = getWaitlistAdapter(ctx.context, options);

			await options.hooks?.waitlist?.get?.before?.(ctx);

			const waitlist = await adapter.findWaitlistByID<ReturnAdditionalFields>(
				ctx.query.id,
			);

			await options.hooks?.waitlist?.get?.after?.(ctx, waitlist);

			return waitlist;
		},
	);
};
