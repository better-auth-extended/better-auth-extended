import {
	getAdditionalPluginFields,
	getPlugin,
	tryCatch,
} from "@better-auth-extended/internal-utils";
import type { admin } from "better-auth/plugins";
import { APP_INVITE_ERROR_CODES } from "./error-codes";
import type { AppInviteOptions } from "./types";
import type { GenericEndpointContext } from "better-auth";

export const getAdditionalFields = <O extends AppInviteOptions>(
	options: O,
) => ({
	appInvitation: getAdditionalPluginFields("appInvitation")(options, false),
});

export type AdditionalPluginFields<O extends AppInviteOptions> = ReturnType<
	typeof getAdditionalFields<O>
>;

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
		ctx.context as any,
	);

	if (!adminPlugin) {
		ctx.context.logger.error("Admin plugin is not set-up.");
		throw ctx.error("FAILED_DEPENDENCY", {
			message: APP_INVITE_ERROR_CODES.ADMIN_PLUGIN_IS_NOT_SET_UP,
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
