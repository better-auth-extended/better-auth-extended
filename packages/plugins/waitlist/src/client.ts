import type { BetterAuthClientPlugin } from "better-auth";
import { waitlist } from "./index";
import type { Waitlist, WaitlistUser } from "./schema";

type WaitlistPlugin = typeof waitlist;

export const waitlistClient = () => {
	return {
		id: "waitlist",
		$InferServerPlugin: {} as ReturnType<WaitlistPlugin>,
		getActions: () => ({
			$Infer: {
				// TODO: Additional fields
				Waitlist: {} as Waitlist,
				WaitlistUser: {} as WaitlistUser,
			},
		}),
		pathMethods: {
			"/waitlist/create": "POST",
			"/waitlist/join": "POST",
			"/waitlist/accept-user": "POST",
			"/waitlist/reject-user": "POST",
		},
	} satisfies BetterAuthClientPlugin;
};
