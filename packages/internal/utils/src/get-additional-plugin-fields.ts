import type {
	BetterAuthOptions,
	BetterAuthPlugin,
	LiteralString,
} from "better-auth";
import {
	toZodSchema,
	type BetterAuthPluginDBSchema,
	type DBFieldAttribute,
	type InferAdditionalFieldsFromPluginOptions,
} from "better-auth/db";

export type WithAdditionalFields<PluginSchema extends BetterAuthPluginDBSchema = any> =
	PluginSchema & {
		[table in string]: {
			additionalFields?: {
				[field in string]: DBFieldAttribute;
			};
		};
	};

export const getAdditionalPluginFields =
	<T extends LiteralString>(table: T) =>
	<
		O extends { schema?: WithAdditionalFields },
		AllPartial extends boolean = false,
	>(
		options: O,
		shouldBePartial: AllPartial = false as AllPartial,
	) => {
		const additionalFields = options.schema?.[table]?.additionalFields || {};
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
			? Partial<InferAdditionalFieldsFromPluginOptions<T, O>>
			: InferAdditionalFieldsFromPluginOptions<T, O>;
		type ReturnAdditionalFields = InferAdditionalFieldsFromPluginOptions<
			T,
			O,
			false
		>;

		return {
			additionalFieldsSchema,
			$AdditionalFields: {} as AllPartial extends true
				? Partial<AdditionalFields>
				: AdditionalFields,
			$ReturnAdditionalFields: {} as ReturnAdditionalFields,
		};
	};

export const inferAdditionalPluginFields =
	<
		PluginId extends LiteralString,
		PluginOptions extends { schema?: WithAdditionalFields },
	>() =>
	<
		O extends { options: BetterAuthOptions },
		S extends PluginOptions["schema"] = undefined,
	>(
		schema?: S,
	) => {
		type FindById<
			T extends readonly BetterAuthPlugin[],
			TargetId extends string,
		> = Extract<T[number], { id: TargetId }>;
		type Auth = O extends { options: any } ? O : { options: { plugins: [] } };

		type Plugin = FindById<
			// @ts-expect-error
			Auth["options"]["plugins"],
			PluginId
		>;

		type Schema = O extends Object
			? O extends Exclude<PluginOptions["schema"], undefined>
				? O
				: Plugin extends { options: { schema: infer S } }
					? S extends PluginOptions["schema"]
						? S
						: undefined
					: undefined
			: undefined;

		return {} as undefined extends S ? Schema : S;
	};
