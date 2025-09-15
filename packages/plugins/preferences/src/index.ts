import type { BetterAuthPlugin, Where } from "better-auth";
import type {
	PreferenceSchemaAttribute,
	PreferenceScopeAttributes,
	PreferencesOptions,
} from "./types";
import { type PreferenceInput, schema } from "./schema";
import { encrypt, decrypt, checkScopePermission, merge } from "./utils";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import type { StandardSchemaV1, UnionToIntersection } from "better-call";
import { PREFERENCES_ERROR_CODES } from "./error-codes";

export const preferences = <
	S extends Record<string, PreferenceScopeAttributes>,
	O extends PreferencesOptions<S>,
>(
	options: O & { scopes: S },
) => {
	return {
		id: "preferences",
		// TODO: Cleanup
		endpoints: {
			setPreference: createAuthEndpoint(
				"/set-preference",
				{
					method: "POST",
					body: z.object({
						scope: z.string(),
						scopeId: z.string().optional(),
						key: z.string(),
						value: z.json(),
					}),
				},
				async (ctx) => {
					const scope = options.scopes[ctx.body.scope];

					if (!scope) {
						throw ctx.error("BAD_REQUEST", {
							message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_NOT_FOUND,
						});
					}
					const config = scope.preferences[ctx.body.key];
					if (!config) {
						throw ctx.error("BAD_REQUEST", {
							message:
								PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_PREFERENCE_NOT_FOUND,
						});
					}
					if (!ctx.body.scopeId && scope.requireScopeId) {
						throw ctx.error("BAD_REQUEST", {
							message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_ID_IS_REQURIED,
						});
					}
					await checkScopePermission(
						{
							type: "canWrite",
							key: ctx.body.key,
							scope: ctx.body.scope,
							value: ctx.body.value,
						},
						scope,
						ctx,
					);

					const where: Where[] = [
						{
							field: "key",
							value: ctx.body.key,
						},
						{
							field: "scope",
							value: ctx.body.scope,
						},
					];
					if (ctx.body.scopeId) {
						where.push({
							field: "scopeId",
							value: ctx.body.scopeId,
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
						if (ctx.body.value === scope.defaultValues?.[ctx.body.key]) {
							await ctx.context.adapter.delete({
								model: "preference",
								where,
							});
							return;
						}
						if (!scope.sensitive && !config.sensitive) {
							const currentValue = JSON.parse(preference.value);
							if (ctx.body.value === currentValue) {
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
												JSON.stringify(ctx.body.value),
												config.secret ?? scope.secret ?? ctx.context.secret,
											)
										: ctx.body.value,
								),
							},
						});
					}

					if (ctx.body.value === scope.defaultValues?.[ctx.body.key]) {
						return;
					}
					await ctx.context.adapter.create<PreferenceInput>({
						model: "preference",
						data: {
							key: ctx.body.key,
							value: JSON.stringify(
								scope.sensitive || config.sensitive
									? await encrypt(
											JSON.stringify(ctx.body.value),
											config.secret ?? scope.secret ?? ctx.context.secret,
										)
									: ctx.body.value,
							),
							scope: ctx.body.scope,
							scopeId: ctx.body.scopeId,
							userId: !scope.disableUserBinding
								? (ctx.context.session?.user.id ?? null)
								: null,
						},
					});
				},
			) as unknown as UnionToIntersection<
				{
					[K in keyof S]: {
						[T in keyof S[K]["preferences"]]: ReturnType<
							typeof createAuthEndpoint<
								"/set-preference",
								{
									method: "POST";
									metadata: {
										$Infer: {
											body: {
												key: T;
												value: StandardSchemaV1.InferInput<
													S[K]["preferences"][T]["type"]
												>;
												scope: K;
											} & (S[K]["requireScopeId"] extends true
												? {
														scopeId: string;
													}
												: S[K]["requireScopeId"] extends false
													? {
															scopeId?: string;
														}
													: {
															scopeId?: never;
														});
										};
									};
								},
								void
							>
						>;
					}[keyof S[K]["preferences"]];
				}[keyof S]
			>,
			getPreference: createAuthEndpoint(
				"/get-preference",
				{
					method: "GET",
					query: z.object({
						scope: z.string(),
						scopeId: z.string().optional(),
						key: z.string(),
					}),
				},
				async (ctx) => {
					const scope = options.scopes[ctx.query.scope];

					if (!scope) {
						throw ctx.error("BAD_REQUEST", {
							message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_NOT_FOUND,
						});
					}
					const config = scope.preferences[ctx.query.key];
					if (!config) {
						throw ctx.error("BAD_REQUEST", {
							message:
								PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_PREFERENCE_NOT_FOUND,
						});
					}
					if (!ctx.query.scopeId && scope.requireScopeId) {
						throw ctx.error("BAD_REQUEST", {
							message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_ID_IS_REQURIED,
						});
					}
					await checkScopePermission(
						{
							type: "canRead",
							key: ctx.query.key,
							scope: ctx.query.scope,
						},
						scope,
						ctx,
					);

					const where: Where[] = [
						{
							field: "key",
							value: ctx.query.key,
						},
						{
							field: "scope",
							value: ctx.query.scope,
						},
					];
					if (ctx.query.scopeId) {
						where.push({
							field: "scopeId",
							value: ctx.query.scopeId,
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

					let value = preference?.value
						? JSON.parse(preference.value)
						: undefined;
					if (scope.sensitive || config.sensitive) {
						const secretKey =
							config.secret ?? scope.secret ?? ctx.context.secret;
						value = JSON.parse(await decrypt(value, secretKey));
					}

					return (
						merge(
							value,
							typeof scope.defaultValues?.[ctx.query.key] === "function"
								? // @ts-expect-error
									await scope.defaultValues[ctx.query.key]()
								: scope.defaultValues?.[ctx.query.key],
							scope.mergeStrategy,
						) ?? null
					);
				},
			) as unknown as UnionToIntersection<
				{
					[K in keyof S]: {
						[T in keyof S[K]["preferences"]]: ReturnType<
							typeof createAuthEndpoint<
								"/get-preferences",
								{
									method: "GET";
									metadata: {
										$Infer: {
											query: {
												key: T;
												scope: K;
											} & (S[K]["requireScopeId"] extends true
												? {
														scopeId: string;
													}
												: S[K]["requireScopeId"] extends false
													? {
															scopeId?: string;
														}
													: {
															scopeId?: never;
														});
										};
									};
								},
								| StandardSchemaV1.InferOutput<S[K]["preferences"][T]["type"]>
								| (S[K]["defaultValues"] extends never
										? null
										: S[K]["defaultValues"] extends {
													[key in K]: infer V;
												}
											? V extends never
												? null
												: V extends () => Awaited<infer R>
													? R
													: V
											: null)
							>
						>;
					}[keyof S[K]["preferences"]];
				}[keyof S]
			>,
		},
		schema,
		options,
		$ERROR_CODES: PREFERENCES_ERROR_CODES,
		$Infer: {
			PreferenceScopes: {} as Extract<keyof S, string>,
			PreferenceScopesDef: {} as S,
		},
	} satisfies BetterAuthPlugin;
};
export const createPreferenceScope = <
	S extends Record<string, PreferenceSchemaAttribute>,
	D extends PreferenceScopeAttributes<S>,
>(
	data: D & { preferences: S },
) => data;
preferences.createScope = createPreferenceScope;

export * from "./client";
export * from "./types";
