import type { appInvite } from ".";
import type {
	BetterAuthClientPlugin,
	BetterAuthOptions,
	BetterAuthPlugin,
} from "better-auth";
import type { AppInvitation } from "./schema";
import type { FieldAttribute } from "better-auth/db";
import type { AppInviteOptions } from "./types";

export const appInviteClient = <
	O extends {
		schema?: {
			appInvitation?: {
				additionalFields?: {
					[key in string]: FieldAttribute;
				};
			};
			user?: {
				additionalFields?: {
					[key in string]: FieldAttribute;
				};
			};
		};
	},
>(
	options?: O,
) => {
	return {
		id: "app-invite",
		$InferServerPlugin: {} as ReturnType<typeof appInvite<O, false>>,
		getActions: () => ({
			$Infer: {
				AppInvitation: {} as AppInvitation,
			},
		}),
		pathMethods: {
			"/invite-user": "POST",
			"/accept-invitation": "POST",
			"/reject-invitation": "POST",
			"/cancel-invitation": "POST",
		},
	} satisfies BetterAuthClientPlugin;
};

export const inferAppInviteAdditonalFields = <
	O extends {
		options: BetterAuthOptions;
	},
	S extends AppInviteOptions["schema"] = undefined,
>(
	schema?: S,
) => {
	type FindById<
		T extends readonly BetterAuthPlugin[],
		TargetId extends string,
	> = Extract<T[number], { id: TargetId }>;
	type Auth = O extends { options: any } ? O : { options: { plugins: [] } };

	type AppInvitePlugin = FindById<
		// @ts-expect-error
		Auth["options"]["plugins"],
		"app-invite"
	>;
	type Schema = O extends Object
		? O extends Exclude<AppInviteOptions["schema"], undefined>
			? O
			: AppInvitePlugin extends { options: { schema: infer S } }
				? S extends AppInviteOptions["schema"]
					? S
					: undefined
				: undefined
		: undefined;

	return {} as undefined extends S ? Schema : S;
};
