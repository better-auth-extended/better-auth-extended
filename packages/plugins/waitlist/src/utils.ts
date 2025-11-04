import {
	getAdditionalPluginFields,
	getPlugin,
	tryCatch,
} from "@better-auth-extended/internal-utils";
import type { GenericEndpointContext } from "better-auth";
import type { admin, AuthMiddleware } from "better-auth/plugins";

export const getAdditionalFields = getAdditionalPluginFields("waitlist");
export const getAdditionalUserFields =
	getAdditionalPluginFields("waitlistUser");

export const conditionalMiddleware = <
	C extends boolean,
	M extends AuthMiddleware,
>(
	condition: C,
	middleware: M,
) => {
	return (condition ? [middleware] : []) as C extends true ? [M] : [];
};

export type AdminPlugin = ReturnType<typeof admin<any>>;

export const checkPermission = async (
	ctx: GenericEndpointContext,
	permissions: {
		[key: string]: string[];
	},
) => {
	const session = ctx.context.session;
	if (!session?.session) {
		throw ctx.error("UNAUTHORIZED");
	}

	const adminPlugin = getPlugin<AdminPlugin>(
		"admin" satisfies AdminPlugin["id"],
		ctx.context,
	);

	if (!adminPlugin) {
		throw ctx.error("FAILED_DEPENDENCY", {
			// TODO: Error codes
			message: "",
		});
	}

	const res = await tryCatch(
		adminPlugin.endpoints.userHasPermission({
			...ctx,
			body: {
				userId: session.user.id,
				permissions,
			},
			returnHeaders: true,
		}),
	);

	return res.data?.response.success ?? false;
};
