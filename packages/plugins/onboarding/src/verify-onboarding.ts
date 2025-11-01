import { APIError, getSessionFromCtx } from "better-auth/api";
import { ONBOARDING_ERROR_CODES } from "./error-codes";
import type { OnboardingOptions } from "./types";
import { getOnboardingAdapter } from "./adapter";
import type { GenericEndpointContext } from "better-auth";

export async function verifyOnboarding(
	ctx: GenericEndpointContext,
	context: {
		adapter?: ReturnType<typeof getOnboardingAdapter>;
		options: OnboardingOptions<any, any>;
	},
) {
	const session = await getSessionFromCtx(ctx);

	if (!session) {
		throw new APIError("UNAUTHORIZED");
	}

	let shouldOnboard = session.user.shouldOnboard;
	if (context.options.secondaryStorage && ctx.context.secondaryStorage) {
		const adapter = context.adapter
			? context.adapter
			: getOnboardingAdapter(context.options, ctx);
		shouldOnboard = await adapter.getShouldOnboard(session.user.id);
	}
	if (!shouldOnboard) {
		throw new APIError("FORBIDDEN", {
			message: ONBOARDING_ERROR_CODES.ALREADY_ONBOARDED,
		});
	}

	return {
		session,
		key: `${session.user.id}!${session.session.id}`,
	};
}
