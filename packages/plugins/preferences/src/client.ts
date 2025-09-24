import type { BetterAuthClientPlugin } from "better-auth";
import type {
	preferences,
	PreferenceScopeAttributes,
	PreferencesOptions,
} from "./index";

export const preferencesClient = <
	Scopes extends {
		$Infer: {
			"~PreferenceScopesDef": Record<string, PreferenceScopeAttributes>;
		};
	},
>() => {
	return {
		id: "preferences",
		$InferServerPlugin: {} as ReturnType<
			typeof preferences<
				Scopes["$Infer"]["~PreferenceScopesDef"],
				PreferencesOptions<Scopes["$Infer"]["~PreferenceScopesDef"]>
			>
		>,
		getActions: () => ({
			$Infer: {
				PreferenceScopes: {} as Extract<
					keyof Scopes["$Infer"]["~PreferenceScopesDef"],
					string
				>,
			},
		}),
	} satisfies BetterAuthClientPlugin;
};
