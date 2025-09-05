import type { BetterAuthClientPlugin } from "better-auth";
import type { onboarding, OnboardingStep } from ".";
import { toPath } from "./utils";

type InferSteps<T> = T extends {
	$Infer: {
		OnboardingSteps: infer Steps extends Record<
			string,
			OnboardingStep<any, any, any>
		>;
	};
}
	? Steps
	: T extends Record<string, OnboardingStep<any, any, any>>
		? T
		: never;

export const onboardingClient = <
	Steps extends {
		$Infer: {
			OnboardingSteps: Record<string, OnboardingStep<any, any, any>>;
			OnboardingCompletionStep: string;
		};
	},
>(options?: {
	/**
	 * a redirect function to call if a user needs
	 * to be onboarded
	 */
	onOnboardingRedirect?: () => void | Promise<void>;
}) => {
	return {
		id: "onboarding",
		$InferServerPlugin: {} as ReturnType<
			typeof onboarding<
				InferSteps<Steps>,
				Steps["$Infer"]["OnboardingCompletionStep"]
			>
		>,
		atomListeners: [
			{
				matcher: (path) => path.startsWith("/onboarding/"),
				signal: "$sessionSignal",
			},
		],

		fetchPlugins: [
			{
				id: "onboarding",
				name: "onboarding",
				hooks: {
					async onSuccess(context) {
						if (context.data?.onboardingRedirect) {
							if (options?.onOnboardingRedirect) {
								await options.onOnboardingRedirect();
							}
						}
					},
					async onRequest(context) {
						const urlPath = toPath(context.url);
						const basePathRaw = toPath(context.baseURL ?? "/api/auth");
						const basePath = basePathRaw.endsWith("/")
							? basePathRaw.slice(0, -1)
							: basePathRaw;
						if (
							urlPath.startsWith(`${basePath}/onboarding/step/`) ||
							urlPath.startsWith(`${basePath}/onboarding/skip-step/`)
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
