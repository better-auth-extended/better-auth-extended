import type {
	BetterAuthPlugin,
	GenericEndpointContext,
	Where,
} from "better-auth";
import type {
	PreferenceSchemaAttribute,
	PreferenceScopeAttributes,
	PreferenceScopeGroupAttributes,
	PreferencesOptions,
} from "./types";
import { z } from "zod";
import { PREFERENCES_ERROR_CODES } from "./error-codes";
import type { PreferenceScopesToEndpoints } from "./internal-types";
import {
	checkScopePermission,
	decrypt,
	encrypt,
	merge,
	transformClientPath,
	transformPath,
} from "./utils";
import { createAuthEndpoint, type AuthEndpoint } from "better-auth/api";
import type { PreferenceInput } from "./schema";

export const preferences = <
	S extends Record<string, PreferenceScopeAttributes>,
	O extends PreferencesOptions<S>,
>(
	options: O & { scopes: S },
) => {
	const setPreferenceSchema = z.object({
		scope: z.string(),
		scopeId: z.string().optional(),
		key: z.string(),
		value: z.json(),
	});
	const setPreference = async (
		ctx: GenericEndpointContext,
		data: z.infer<typeof setPreferenceSchema>,
	) => {
		const scope = options.scopes[data.scope];
		if (!scope) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_NOT_FOUND,
			});
		}
		const config = scope.preferences[data.key];
		if (!config) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_PREFERENCE_NOT_FOUND,
			});
		}
		if (!data.scopeId && scope.requireScopeId) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_ID_IS_REQURIED,
			});
		}
		await checkScopePermission(
			{
				type: "canWrite",
				key: data.key,
				scope: data.scope,
				value: data.value,
			},
			scope,
			ctx,
		);

		const where: Where[] = [
			{
				field: "key",
				value: data.key,
			},
			{
				field: "scope",
				value: data.scope,
			},
		];
		if (data.scopeId) {
			where.push({
				field: "scopeId",
				value: data.scopeId,
			});
		}
		if (!scope.disableUserBinding) {
			where.push({
				field: "userId",
				value: ctx.context.session?.user.id ?? null,
			});
		}

		const preference = await ctx.context.adapter.findOne<{
			value: string;
		}>({
			model: "preference",
			where,
			select: ["value"],
		});
		if (preference) {
			if (data.value === scope.defaultValues?.[data.key]) {
				await ctx.context.adapter.delete({
					model: "preference",
					where,
				});
				return;
			}
			if (!scope.sensitive && !config.sensitive) {
				const currentValue = JSON.parse(preference.value);
				if (data.value === currentValue) {
					return;
				}
			}
			await ctx.context.adapter.update({
				model: "preference",
				where,
				update: {
					value: JSON.stringify(
						scope.sensitive || config.sensitive
							? await encrypt(
									JSON.stringify(data.value),
									config.secret ?? scope.secret ?? ctx.context.secret,
								)
							: data.value,
					),
				},
			});
		}

		if (data.value === scope.defaultValues?.[data.key]) {
			return;
		}
		await ctx.context.adapter.create<PreferenceInput>({
			model: "preference",
			data: {
				key: data.key,
				value: JSON.stringify(
					scope.sensitive || config.sensitive
						? await encrypt(
								JSON.stringify(data.value),
								config.secret ?? scope.secret ?? ctx.context.secret,
							)
						: data.value,
				),
				scope: data.scope,
				scopeId: data.scopeId,
				userId: !scope.disableUserBinding
					? (ctx.context.session?.user.id ?? null)
					: null,
			},
		});
	};

	const getPreferenceSchema = z.object({
		scope: z.string(),
		scopeId: z.string().optional(),
		key: z.string(),
	});
	const getPreference = async (
		ctx: GenericEndpointContext,
		data: z.infer<typeof getPreferenceSchema>,
	) => {
		const scope = options.scopes[data.scope];

		if (!scope) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_NOT_FOUND,
			});
		}
		const config = scope.preferences[data.key];
		if (!config) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_PREFERENCE_NOT_FOUND,
			});
		}
		if (!data.scopeId && scope.requireScopeId) {
			throw ctx.error("BAD_REQUEST", {
				message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_ID_IS_REQURIED,
			});
		}
		await checkScopePermission(
			{
				type: "canRead",
				key: data.key,
				scope: data.scope,
			},
			scope,
			ctx,
		);

		const where: Where[] = [
			{
				field: "key",
				value: data.key,
			},
			{
				field: "scope",
				value: data.scope,
			},
		];
		if (data.scopeId) {
			where.push({
				field: "scopeId",
				value: data.scopeId,
			});
		}
		if (!scope.disableUserBinding) {
			where.push({
				field: "userId",
				value: ctx.context.session?.user.id ?? null,
			});
		}
		const preference = await ctx.context.adapter.findOne<{
			value: string;
		}>({
			model: "preference",
			where,
			select: ["value"],
		});

		let value = preference?.value ? JSON.parse(preference.value) : undefined;
		if (scope.sensitive || config.sensitive) {
			const secretKey = config.secret ?? scope.secret ?? ctx.context.secret;
			value = JSON.parse(await decrypt(value, secretKey));
		}

		return (
			merge(
				value,
				typeof scope.defaultValues?.[data.key] === "function"
					? // @ts-expect-error
						await scope.defaultValues[data.key]()
					: scope.defaultValues?.[data.key],
				scope.mergeStrategy,
			) ?? null
		);
	};

	const scopes = Object.entries(options.scopes);
	const endpoints = Object.fromEntries(
		scopes.flatMap(([id, scope]) => {
			const scopeKey = transformPath(id);
			const scopePath = transformClientPath(id);

			const endpoints = Object.fromEntries(
				Object.entries(scope.preferences).flatMap(([key, config]) => {
					const preferenceKey = transformPath(key);
					const preferencePath = transformClientPath(key);

					return Object.entries({
						[`set${scopeKey}${preferenceKey}Preference`]: createAuthEndpoint(
							`/preferences/${scopePath}/${preferenceKey}/set`,
							{
								method: "POST",
								body: z.object({
									scopeId: z.string().optional(),
									value: z.json(),
								}),
							},
							async (ctx) => {
								return await setPreference(ctx, {
									key,
									scope: id,
									value: ctx.body.value,
									scopeId: ctx.body.scopeId,
								});
							},
						),
						[`get${scopeKey}${preferenceKey}Preference`]: createAuthEndpoint(
							`/preferences/${scopePath}/${preferencePath}/get`,
							{
								method: "GET",
								query: z.object({
									scopeId: z.string().optional(),
								}),
							},
							async (ctx) => {
								return await getPreference(ctx, {
									key,
									scope: id,
									scopeId: ctx.query.scopeId,
								});
							},
						),
					} as Record<string, AuthEndpoint>);
				}),
			);

			return Object.entries(endpoints);
		}),
	) as PreferenceScopesToEndpoints<S>;

	return {
		id: "preferences",
		// TODO: Cleanup
		endpoints: {
			getPreference: createAuthEndpoint(
				"/preferences/get-preference",
				{
					method: "GET",
					query: getPreferenceSchema,
				},
				async (ctx) => {
					return await getPreference(ctx, ctx.query);
				},
			),
			setPreference: createAuthEndpoint(
				"/preferences/set-preference",
				{
					method: "POST",
					body: setPreferenceSchema,
				},
				async (ctx) => {
					return await setPreference(ctx, ctx.body);
				},
			),
			...endpoints,
		},
		options,
		$ERROR_CODES: PREFERENCES_ERROR_CODES,
		$Infer: {
			Test: {} as PreferenceScopesToEndpoints<S>,
			PreferenceScopes: {} as Extract<keyof S, string>,
			"~PreferenceScopesDef": {} as S,
		},
	} satisfies BetterAuthPlugin;
};
export const createPreferenceScope = <
	S extends Record<string, PreferenceSchemaAttribute>,
	G extends Record<string, PreferenceScopeGroupAttributes<S>>,
	D extends PreferenceScopeAttributes<S, G>,
>(
	data: D & { preferences: S; groups?: G },
) => data;
preferences.createScope = createPreferenceScope;

export * from "./client";
export * from "./types";
