import type { AuthContext, User, Where } from "better-auth";
import type { Waitlist, CreateWaitlist, WaitlistOptions } from "./types";
import type { WaitlistInput } from "./schema";

type WithAdditionalFields<
	T,
	AdditionalFields extends Record<string, any> = Record<string, any>,
> = T & {
	additionalFields?: {} | AdditionalFields;
};

export const getWaitlistAdapter = (
	context: AuthContext,
	options?: WaitlistOptions,
) => {
	const adapter = context.adapter;

	return {
		createWaitlist: async <AdditionalFields extends Record<string, any>>(
			data: WithAdditionalFields<Omit<WaitlistInput, "id">, AdditionalFields>,
		) => {
			const newWaitlist = await adapter.create<
				WaitlistInput,
				Waitlist & AdditionalFields
			>({
				model: "waitlist",
				data: {
					...data,
					maxParticipants: data.maxParticipants ?? undefined,
					...(data.additionalFields ?? {}),
				},
			});

			return newWaitlist;
		},
	};
};
