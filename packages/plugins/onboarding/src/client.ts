import type { BetterAuthClientPlugin } from "better-auth";
import type { onboarding } from "./index";

type Onboarding = typeof onboarding;

export const onboardingClient = () => {
	return {
		id: "onboarding",
		$InferServerPlugin: {} as ReturnType<Onboarding>,
	} satisfies BetterAuthClientPlugin;
};
