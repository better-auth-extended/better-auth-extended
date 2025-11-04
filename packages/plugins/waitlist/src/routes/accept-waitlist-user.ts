import type { WaitlistOptions } from "../types";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import z from "zod";
import {
	checkPermission,
	conditionalMiddleware,
	type getAdditionalUserFields,
} from "../utils";

export const acceptWaitlistUser = <
	O extends WaitlistOptions,
	A extends ReturnType<typeof getAdditionalUserFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields, $AdditionalFields }: A,
) => {
	type AdditionalFields = typeof $AdditionalFields;
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/waitlist/accept-user",
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
				typeof options.canAcceptUser === "function"
					? await options.canAcceptUser(ctx)
					: await checkPermission(ctx, {
							[options.canAcceptUser.statement]:
								options.canAcceptUser.permissions,
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
