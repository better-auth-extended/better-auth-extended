import type { GenericEndpointContext } from "better-auth/types";
import type { StandardSchemaV1 } from "better-call";
import type { z } from "zod";
import type { Permission } from "./internal-types";

export type PreferenceSchemaAttribute<S = any> = {
	type: StandardSchemaV1<unknown, S>;
	sensitive?: boolean;
	secret?: string;
};

export type PreferenceScopeGroupAttributes<
	S extends Record<string, PreferenceSchemaAttribute> = Record<
		string,
		PreferenceSchemaAttribute
	>,
> = {
	preferences: Partial<Record<keyof S, boolean>>;
	operations?: "read" | "write" | ["read", "write"] | ["write", "read"];
};

export type PreferenceScopeAttributes<
	S extends Record<string, PreferenceSchemaAttribute> = Record<
		string,
		PreferenceSchemaAttribute
	>,
	G extends Record<string, PreferenceScopeGroupAttributes<S>> = Record<string, PreferenceScopeGroupAttributes<S>>
	> = {
	preferences: S;
	groups?: G;
	defaultValues?: Partial<{
		[K in keyof S]:
			| StandardSchemaV1.InferInput<S[K]["type"]>
			| (() =>
					| Promise<StandardSchemaV1.InferInput<S[K]["type"]>>
					| StandardSchemaV1.InferInput<S[K]["type"]>);
	}>;
	canRead?:
		| ((
				data: {
					key: string;
					scope: string;
				},
				ctx: GenericEndpointContext,
		  ) => Promise<boolean> | boolean | Promise<Permission> | Permission)
		| boolean
		| Permission;
	canWrite?:
		| ((
				data: {
					key: string;
					scope: string;
					value: z.util.JSONType;
				},
				ctx: GenericEndpointContext,
		  ) => Promise<boolean> | boolean | Promise<Permission> | Permission)
		| boolean
		| Permission;
	requireScopeId?: boolean;
	disableUserBinding?: boolean;
	mergeStrategy?: "deep" | "replace";
	sensitive?: boolean;
	secret?: string;
};

export type PreferencesOptions<
	Scopes extends Record<string, PreferenceScopeAttributes> = Record<
		string,
		PreferenceScopeAttributes
	>,
> = {
	scopes: Scopes;
};
