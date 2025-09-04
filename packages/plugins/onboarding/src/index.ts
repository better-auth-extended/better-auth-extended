import type { BetterAuthPlugin } from "better-auth";

export const onboarding = () => {
	return {
		id: "onboarding",
	} satisfies BetterAuthPlugin;
};

export * from "./client";

export type * from "better-call";
