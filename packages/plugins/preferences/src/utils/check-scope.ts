import type { GenericEndpointContext } from "better-auth/types";
import type { PreferencesOptions } from "../types";
import { PREFERENCES_ERROR_CODES } from "../error-codes";

export const checkScope = (
	ctx: GenericEndpointContext,
	options: PreferencesOptions,
	data: { scope: string; scopeId?: string; key: string },
) => {
	const scope = options.scopes[data.scope];
	if (!scope) {
		throw ctx.error("BAD_REQUEST", {
			message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_NOT_FOUND,
		});
	}
	const config = scope.preferences[data.key];
	if (!config) {
		throw ctx.error("BAD_REQUEST", {
			message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_PREFERENCE_NOT_FOUND,
		});
	}
	if (!data.scopeId && scope.requireScopeId) {
		throw ctx.error("BAD_REQUEST", {
			message: PREFERENCES_ERROR_CODES.PREFERENCE_SCOPE_ID_IS_REQURIED,
		});
	}

	return {
		scope,
		config,
	};
};
