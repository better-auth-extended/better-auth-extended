import type { BetterAuthPlugin } from "better-auth";
import type { WaitlistOptions } from "./types";
import { schema, type WaitlistUser } from "./schema";
import { mergeSchema } from "better-auth/db";
import { joinWaitlist } from "./routes/join-waitlist";
import { getAdditionalFields } from "./utils";

export const waitlist = <O extends WaitlistOptions>(options: O) => {
	const opts = {
		// TODO: add default options
		...options,
	} satisfies WaitlistOptions;

	const mergedSchema = mergeSchema(schema, opts.schema);
	mergedSchema.waitlistUser.fields = {
		...mergedSchema.waitlistUser.fields,
		...opts.schema?.waitlistUser?.additionalFields,
	};

	const additionalFields = getAdditionalFields(options as O, false);

	const endpoints = {
		joinWaitlist: joinWaitlist(
			opts as O,
			additionalFields as typeof additionalFields,
		),
	};

	// TODO: Shim context

	return {
		id: "waitlist",
		endpoints,
		schema: mergedSchema,
		options: opts,
		$Infer: {
			WaitlistUser: {} as WaitlistUser &
				typeof additionalFields.$ReturnAdditionalFields,
		},
	} satisfies BetterAuthPlugin;
};

export * from "./client";
export * from "./types";
