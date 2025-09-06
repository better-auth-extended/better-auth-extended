import type { BetterAuthPlugin } from "better-auth";
import type { WaitlistOptions } from "./types";
import { schema, type Waitlist, type WaitlistUser } from "./schema";
import { mergeSchema } from "better-auth/db";
import {
	joinWaitlist,
	acceptWaitlistUser,
	createWaitlist,
	rejectWaitlistUser,
} from "./routes";
import { getAdditionalFields, getAdditionalUserFields } from "./utils";

export const waitlist = <O extends WaitlistOptions>(options: O) => {
	const opts = {
		// TODO: add default options
		...options,
	} satisfies WaitlistOptions;

	const mergedSchema = mergeSchema(schema, opts.schema);
	mergedSchema.waitlist.fields = {
		...mergedSchema.waitlist.fields,
		...opts.schema?.waitlistUser?.additionalFields,
	};
	mergedSchema.waitlistUser.fields = {
		...mergedSchema.waitlistUser.fields,
		...opts.schema?.waitlistUser?.additionalFields,
	};

	const additionalWaitlistFields = getAdditionalFields(options as O, false);
	const additionalUserFields = getAdditionalUserFields(options as O, false);

	const endpoints = {
		acceptWaitlistUser: acceptWaitlistUser(opts as O, additionalUserFields),
		createWaitlist: createWaitlist(opts as O, additionalWaitlistFields),
		joinWaitlist: joinWaitlist(opts as O, additionalUserFields),
		rejectWaitlistUser: rejectWaitlistUser(opts as O, additionalUserFields),
	};

	return {
		id: "waitlist",
		endpoints,
		schema: mergedSchema,
		options: opts,
		$Infer: {
			Waitlist: {} as Waitlist &
				typeof additionalWaitlistFields.$ReturnAdditionalFields,
			WaitlistUser: {} as WaitlistUser &
				typeof additionalUserFields.$ReturnAdditionalFields,
		},
	} satisfies BetterAuthPlugin;
};

export * from "./client";
export * from "./types";
