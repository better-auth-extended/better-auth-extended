import type { BetterAuthPlugin } from "better-auth";
import type { WaitlistOptions } from "./types";

export const waitlist = <O extends WaitlistOptions>(options: O) => {
	const opts = {
		// TODO: add default options
		...options,
	} satisfies WaitlistOptions;

	return {
		id: "waitlist",
	} satisfies BetterAuthPlugin;
};

export * from "./client";

export type * from "better-call";
