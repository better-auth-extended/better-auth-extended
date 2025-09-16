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
	checkScope,
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
		skipPermissionCheck: boolean = false,
	) => {
		const { scope, config } = checkScope(ctx, options, data);
		if (!skipPermissionCheck) {
			await checkScopePermission(
				{
					type: "canWrite",
					key: [data.key],
					scope: data.scope,
					values: {
						[data.key]: data.value,
					},
				},
				scope,
				ctx,
			);
		}

		const valueResult = await config.type["~standard"].validate(data.value);
		if (valueResult.issues?.length) {
			throw ctx.error("BAD_REQUEST", {
				message: z.prettifyError(valueResult),
			});
		}

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
		skipPermissionCheck: boolean = false,
	) => {
		const { scope, config } = checkScope(ctx, options, data);
		if (!skipPermissionCheck) {
			await checkScopePermission(
				{
					type: "canRead",
					key: [data.key],
					scope: data.scope,
				},
				scope,
				ctx,
			);
		}

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

			const endpoints = Object.keys(scope.preferences).flatMap((key) => {
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
			});

			const groupEndpoints = scope.groups
				? Object.entries(scope.groups).flatMap(([key, config]) => {
						const endpoints: Record<string, AuthEndpoint> = {};
						const groupKey = transformPath(key);
						const groupPath = `$${transformClientPath(key)}`;

						const enabledPreferences = Object.entries(config.preferences)
							.filter(([_, value]) => !!value)
							.map(([key]) => key);
						if (
							config.operations === "read" ||
							config.operations?.includes("read")
						) {
							endpoints[`get${scopeKey}${groupKey}Preferences`] =
								createAuthEndpoint(
									`/preferences/${scopeKey}/${groupPath}/get`,
									{
										method: "GET",
										query: z.object({
											scopeId: z.string().optional(),
										}),
									},
									async (ctx) => {
										await checkScopePermission(
											{
												type: "canRead",
												key: enabledPreferences,
												scope: id,
												scopeId: ctx.query.scopeId,
											},
											scope,
											ctx,
										);

										const result: Record<string, any> = {};
										for (const key of enabledPreferences) {
											result[key] = await getPreference(
												ctx,
												{
													key,
													scope: id,
													scopeId: ctx.query.scopeId,
												},
												true,
											);
										}

										return result;
									},
								);
						}
						if (
							config.operations === "write" ||
							config.operations?.includes("write")
						) {
							endpoints[`set${scopeKey}${groupKey}Preferences`] =
								createAuthEndpoint(
									`/preferences/${scopeKey}/${groupPath}/set`,
									{
										method: "POST",
										body: z.object({
											values: z.record(z.enum(enabledPreferences), z.json()),
											scopeId: z.string().optional(),
										}),
									},
									async (ctx) => {
										await checkScopePermission(
											{
												type: "canWrite",
												key: enabledPreferences,
												scope: id,
												values: ctx.body.values,
												scopeId: ctx.body.scopeId,
											},
											scope,
											ctx,
										);

										for (const [key, value] of Object.entries(
											ctx.body.values,
										)) {
											await setPreference(
												ctx,
												{
													key,
													scope: id,
													scopeId: ctx.body.scopeId,
													value,
												},
												true,
											);
										}
									},
								);
						}

						return Object.entries(endpoints);
					})
				: [];

			return [...endpoints, ...groupEndpoints];
		}),
	) as PreferenceScopesToEndpoints<S>;

	return {
		id: "preferences",
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
