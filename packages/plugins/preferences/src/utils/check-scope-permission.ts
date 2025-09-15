import type { GenericEndpointContext } from "better-auth/types";
import type { Permission, PreferenceScopeAttributes } from "../types";
import type { admin } from "better-auth/plugins";
import { getPlugin, tryCatch } from "@better-auth-extended/internal-utils";
import type { z } from "zod";
import { PREFERENCES_ERROR_CODES } from "../error-codes";

export const checkScopePermission = async (
	data:
		| {
				type: "canWrite";
				key: string;
				value: z.util.JSONType;
				scope: string;
		  }
		| {
				type: "canRead";
				key: string;
				scope: string;
		  },
	scope: PreferenceScopeAttributes,
	ctx: GenericEndpointContext,
) => {
	if (!scope.disableUserBinding) {
		if (ctx.context.session?.user) {
			throw ctx.error("UNAUTHORIZED");
		}
	}

	const value = scope[data.type];
	if (!value) {
		return true;
	}

	let hasPerm = false;
	const run = async (value: any) => {
		if (typeof value === "boolean") {
			hasPerm = value;
		} else if (typeof value === "object") {
			hasPerm = await checkPermission(ctx, {
				[value.statement]: value.permissions,
			});
		}
	};
	await run(value);

	if (typeof value === "function") {
		const fn = value as (
			...args: any[]
		) => Promise<boolean> | boolean | Promise<Permission> | Permission;
		const result = await fn(
			...[data.key, "value" in data && data.value, ctx].filter(Boolean),
		);
		await run(result);
	}

	if (!hasPerm) {
		throw ctx.error("FORBIDDEN", {
			message: PREFERENCES_ERROR_CODES.PREFERENCE_MISSING_PERMISSION,
		});
	}
};

type AdminPlugin = ReturnType<typeof admin<any>>;

const checkPermission = async (
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
			message: PREFERENCES_ERROR_CODES.PREFERENCE_MISSING_PERMISSION,
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
