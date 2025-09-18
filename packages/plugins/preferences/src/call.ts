import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

export const preferencesMiddleware = createAuthMiddleware(async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	return {
		session,
	};
});
