import type { WaitlistOptions } from "../types";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import z from "zod";
import {
	checkPermission,
	conditionalMiddleware,
	type getAdditionalUserFields,
} from "../utils";

export const rejectWaitlistUser = <
	O extends WaitlistOptions,
	A extends ReturnType<typeof getAdditionalUserFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields, $AdditionalFields }: A,
) => {
	type AdditionalFields = typeof $AdditionalFields;
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/waitlist/reject-user",
		{
			method: "POST",
			body: z.object({
				waitlistId: z.string(),
				email: z.email(),
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
				typeof options.canRejectUser === "function"
					? await options.canRejectUser(ctx)
					: await checkPermission(ctx, {
							[options.canRejectUser.statement]:
								options.canRejectUser.permissions,
						});

			if (!canAccess) {
				throw ctx.error("FORBIDDEN", {
					// TODO: Error codes
					message: "",
				});
			}

			// TODO:
		},
	);
};
