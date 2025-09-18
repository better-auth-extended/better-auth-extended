import type { createAuthEndpoint } from "better-auth/api";
import type {
	PreferenceSchemaAttribute,
	PreferenceScopeAttributes,
	PreferenceScopeGroupAttributes,
} from "./types";
import { type TransformClientPath, type TransformPath } from "./utils";
import type { StandardSchemaV1 } from "better-call";

export type Permission = {
	statement: string;
	permissions: string[];
};

type AllOptional<T> = {
	[K in keyof T]-?: {} extends Pick<T, K> ? true : false;
}[keyof T] extends true
	? true
	: false;

type MakeOptionalIfAllOptional<T> = AllOptional<T> extends true
	? T | undefined
	: T;

type InferPreferenceInput<
	S extends PreferenceScopeAttributes,
	P extends PreferenceSchemaAttribute,
	OmitValue extends boolean = false,
> = MakeOptionalIfAllOptional<
	(OmitValue extends true
		? {}
		: { value: StandardSchemaV1.InferInput<P["type"]> }) &
		(S["requireScopeId"] extends true
			? { scopeId: string }
			: { scopeId?: string })
>;

type InferPreferenceOutput<
	Preference extends string,
	S extends PreferenceScopeAttributes,
	P extends PreferenceSchemaAttribute,
> = StandardSchemaV1.InferOutput<P["type"]> | S["defaultValues"] extends {
	[key in Preference]: infer V;
}
	? V extends () => Awaited<infer R>
		? R
		: V extends undefined
			? null
			: V
	: null;

export type EndpointPair<
	Scope extends string,
	Preference extends string,
	S extends PreferenceScopeAttributes,
	P extends PreferenceSchemaAttribute,
> = {
	set: ReturnType<
		typeof createAuthEndpoint<
			`/preferences/${TransformClientPath<Scope>}/${TransformClientPath<Preference>}/set`,
			{
				method: "POST";
				metadata: {
					$Infer: {
						body: InferPreferenceInput<S, P>;
					};
				};
			},
			void
		>
	>;
	get: ReturnType<
		typeof createAuthEndpoint<
			`/preferences/${TransformClientPath<Scope>}/${TransformClientPath<Preference>}/get`,
			{
				method: "GET";
				metadata: {
					$Infer: {
						query: InferPreferenceInput<S, P, true>;
					};
				};
			},
			InferPreferenceOutput<Preference, S, P>
		>
	>;
};

type FilteredGroupPreferences<T extends Partial<Record<string, boolean>>> = {
	[K in keyof T as T[K] extends false ? never : K]: T[K];
};
type InferGroupInput<
	S extends PreferenceScopeAttributes,
	G extends PreferenceScopeGroupAttributes<S["preferences"]>,
	OmitValue extends boolean = false,
> = MakeOptionalIfAllOptional<
	(OmitValue extends true
		? {}
		: {
				values: {
					[K in keyof FilteredGroupPreferences<
						G["preferences"]
					>]: StandardSchemaV1.InferInput<S["preferences"][K]["type"]>;
				};
			}) & {
		scopeId?: string;
	}
>;

type InferGroupOutput<
	S extends PreferenceScopeAttributes,
	G extends PreferenceScopeGroupAttributes<S["preferences"]>,
> = {
	[K in keyof FilteredGroupPreferences<
		G["preferences"]
	>]: StandardSchemaV1.InferOutput<S["preferences"][K]["type"]> | null;
};

type GroupEndpointPair<
	Scope extends string,
	Group extends string,
	S extends PreferenceScopeAttributes,
	G extends PreferenceScopeGroupAttributes<S["preferences"]>,
> = {
	set: G["operations"] extends
		| never
		| "write"
		| ["write", "read"]
		| ["read", "write"]
		? ReturnType<
				typeof createAuthEndpoint<
					`/preferences/${TransformClientPath<Scope>}/$${TransformClientPath<Group>}/set`,
					{
						method: "POST";
						metadata: {
							$Infer: {
								body: InferGroupInput<S, G>;
							};
						};
					},
					void
				>
			>
		: never;
	get: G["operations"] extends
		| never
		| "read"
		| ["write", "read"]
		| ["read", "write"]
		? ReturnType<
				typeof createAuthEndpoint<
					`/preferences/${TransformClientPath<Scope>}/$${TransformClientPath<Group>}/get`,
					{
						method: "GET";
						metadata: {
							$Infer: {
								query: InferGroupInput<S, G, true>;
							};
						};
					},
					InferGroupOutput<S, G>
				>
			>
		: never;
};

type AffixedGroupEndpoints<
	Scope extends string,
	Group extends string,
	S extends PreferenceScopeAttributes,
	G extends PreferenceScopeGroupAttributes<S["preferences"]>,
> = {
	[K in keyof GroupEndpointPair<
		Scope,
		Group,
		S,
		G
	> as `${Extract<K, string>}${TransformPath<Scope>}${TransformPath<Group>}Preferences`]: GroupEndpointPair<
		Scope,
		Group,
		S,
		G
	>[K];
};

type AffixedEndpoints<
	Scope extends string,
	Preference extends string,
	S extends PreferenceScopeAttributes,
	P extends PreferenceSchemaAttribute,
> = {
	[K in keyof EndpointPair<
		Scope,
		Preference,
		S,
		P
	> as `${Extract<K, string>}${TransformPath<Scope>}${TransformPath<Preference>}Preference`]: EndpointPair<
		Scope,
		Preference,
		S,
		P
	>[K];
};

export type PreferenceScopesToEndpoints<
	S extends Record<string, PreferenceScopeAttributes>,
> = {
	[K in keyof S & string]: {
		[T in keyof S[K]["preferences"] & string]: AffixedEndpoints<
			K,
			T,
			S[K],
			S[K]["preferences"][T]
		>;
	}[keyof S[K]["preferences"] & string] &
		(S[K]["groups"] extends infer V
			? V extends Record<string, PreferenceScopeGroupAttributes>
				? {
						[T in keyof V & string]: AffixedGroupEndpoints<K, T, S[K], V[T]>;
					}[keyof V & string]
				: {}
			: {});
}[keyof S & string];
