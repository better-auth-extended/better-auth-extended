import { createAuthMiddleware } from "better-auth/api";

export const waitlistMiddleware = createAuthMiddleware(async () => {
	return {} as {
		// TODO:
		scheduler: {};
	};
});
