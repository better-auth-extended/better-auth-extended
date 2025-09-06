import type { WaitlistOptions } from "../types";
import { createAuthEndpoint } from "better-auth/api";
import z from "zod";
import type { getAdditionalUserFields } from "../utils";

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
		},
		async (ctx) => {
			// TODO:
		},
	);
};
