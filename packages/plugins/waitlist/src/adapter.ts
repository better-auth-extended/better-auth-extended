import type { AuthContext } from "better-auth";
import type { Waitlist, WaitlistOptions } from "./types";
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
		findWaitlistByID: async <AdditionalFields extends Record<string, any>>(
			id: string,
		) => {
			const waitlist = await adapter.findOne<Waitlist & AdditionalFields>({
				model: "waitlist",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});

			return waitlist;
		},
	};
};
