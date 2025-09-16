import type { BetterAuthClientPlugin } from "better-auth";
import type {
	preferences,
	PreferenceScopeAttributes,
	PreferencesOptions,
} from "./index";
import { toPath } from "./utils";

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
		fetchPlugins: [
			{
				id: "preferences",
				name: "preferences",
				hooks: {
					async onRequest(context) {
						const urlPath = toPath(context.url);
						const basePathRaw = toPath(context.baseURL ?? "/api/auth");
						const basePath = basePathRaw.endsWith("/")
							? basePathRaw.slice(0, -1)
							: basePathRaw;
						if (urlPath === `${basePath}/preferences/set-preference`) {
							return {
								...context,
								method: "POST",
							};
						} else if (
							urlPath.startsWith(`${basePath}/preferences/`) &&
							urlPath.endsWith("/set")
						) {
							return {
								...context,
								method: "POST",
							};
						}
					},
				},
			},
		],
	} satisfies BetterAuthClientPlugin;
};
