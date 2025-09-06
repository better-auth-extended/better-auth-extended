import type { CreateWaitlist, WaitlistOptions } from "../types";
import { createAuthEndpoint } from "better-auth/api";
import z from "zod";
import type { getAdditionalFields } from "../utils";
import { waitlistEndEvent } from "../schema";
import { toZodSchema } from "better-auth/db";
import type { IsExactlyEmptyObject } from "@better-auth-extended/internal-utils";

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
			body: z.object({
				endEvent: z.enum(waitlistEndEvent),
				maxParticipants: z.number().optional(),
				beginsAt: z.date().default(() => new Date()),
				endsAt: z.date().optional(),
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
			// TODO:
		},
	);
};
