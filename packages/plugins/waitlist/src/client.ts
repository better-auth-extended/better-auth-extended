import type { BetterAuthClientPlugin } from "better-auth";
import type { waitlist } from "./index";

type Waitlist = typeof waitlist

export const waitlistClient = () => {
    return {
        id: "waitlist",
        $InferServerPlugin: {} as ReturnType<Waitlist>,
    } satisfies BetterAuthClientPlugin;
};
