import type { WaitlistOptions } from "../types";
import { createAuthEndpoint } from "better-auth/api";
import z from "zod";
import type { getAdditionalFields } from "../utils";

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
		},
		async (ctx) => {
			// TODO:
		},
	);
};
