import {
	getAdditionalPluginFields,
	type IsExactlyEmptyObject,
} from "@better-auth-extended/internal-utils";
import type { WaitlistOptions } from "../types";
import { createAuthEndpoint } from "better-auth/api";
import z from "zod";
import { toZodSchema } from "better-auth/db";
import { waitlistMiddleware } from "../call";

const x = getAdditionalPluginFields("waitlistUser");

export const joinWaitlist = <
	O extends WaitlistOptions,
	A extends ReturnType<typeof x<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields, $AdditionalFields }: A,
) => {
	type AdditionalFields = typeof $AdditionalFields;
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/waitlist/join",
		{
			method: "POST",
			body: z.object({
				name: z.string(),
				email: z.email(),
				additionalFields: z
					.object({
						...(options.schema?.waitlistUser?.additionalFields
							? toZodSchema({
									fields: options.schema?.waitlistUser?.additionalFields,
									isClientSide: true,
								})
							: {}),
					})
					.optional(),
			}),
			metadata: {
				$Infer: {
					body: {} as {
						name: string;
						email: string;
					} & (IsExactlyEmptyObject<AdditionalFields> extends true
						? { additionalFields?: {} }
						: { additionalFields: AdditionalFields }),
				},
			},
		},
		async (ctx) => {ctx.context.secondaryStorage.
			// TODO:
		},
	);
};
