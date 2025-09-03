import { type InferAdditionalFieldsFromPluginOptions, toZodSchema } from "better-auth/db";
import type { AppInviteOptions } from "./types";
import type { AuthContext, BetterAuthPlugin } from "better-auth";

export const getPlugin = <P extends BetterAuthPlugin = BetterAuthPlugin>(
	id: string,
	context: AuthContext,
) => {
	return context.options.plugins?.find((p) => p.id === id) as P | undefined;
};

export const getAdditionalFields = <O extends AppInviteOptions, AllPartial extends boolean = false>(
	options: O,
	shouldBePartial: AllPartial = false as AllPartial,
) => {
	const additionalFields = options.schema?.appInvitation?.additionalFields || {};
	if (shouldBePartial) {
		for (const key in additionalFields) {
			additionalFields[key]!.required = false;
		}
	}
	const additionalFieldsSchema = toZodSchema({
		fields: additionalFields,
		isClientSide: true,
	});
	type AdditionalFields = AllPartial extends true
		? Partial<InferAdditionalFieldsFromPluginOptions<"appInvitation", O>>
		: InferAdditionalFieldsFromPluginOptions<"appInvitation", O>;
	type ReturnAdditionalFields = InferAdditionalFieldsFromPluginOptions<"appInvitation", O, false>;

	return {
		additionalFieldsSchema,
		$AdditionalFields: {} as AllPartial extends true
			? Partial<AdditionalFields>
			: AdditionalFields,
		$ReturnAdditionalFields: {} as ReturnAdditionalFields,
	};
};
