import { logger, type BetterAuthPlugin } from "better-auth";
import type { AppInviteOptions } from "./types";
import { APP_INVITE_ERROR_CODES } from "./error-codes";
import type { AppInvitation } from "./schema";
import {
	createAppInvitation,
	getAppInvitation,
	acceptAppInvitation,
	rejectAppInvitation,
	cancelAppInvitation,
	listAppInvitations,
} from "./routes";
import { getAdditionalFields } from "./utils";

export const appInvite = <O extends AppInviteOptions, S extends boolean = true>(
	opts?: O,
) => {
	if (opts?.allowUserToCreateInvitation) {
		logger.warn(
			"`allowUserToCreateInvitation` is deprecated. Consider using `canCreateInvitation` instead.",
		);
	}
	if (opts?.allowUserToCancelInvitation) {
		logger.warn(
			"`allowUserToCancelInvitation` is deprecated. Consider using `canCancelInvitation` instead.",
		);
	}

	const options = {
		canCreateInvitation: true,
		canCancelInvitation(ctx, invite) {
			return invite.inviterId === ctx.context.session?.user.id;
		},
		cleanupExpiredInvitations: true,
		cleanupPersonalInvitesOnDecision: false,
		verifyEmailOnAccept: true,
		rateLimit: {
			window: 60,
			max: 5,
		},
		...opts,
	} satisfies AppInviteOptions;

	const additionalFields = getAdditionalFields(options as O);

	const endpoints = {
		createAppInvitation: createAppInvitation<O, S>(
			options as O,
			additionalFields,
		),
		getAppInvitation: getAppInvitation(options as O, additionalFields),
		acceptAppInvitation: acceptAppInvitation(options as O, additionalFields),
		rejectAppInvitation: rejectAppInvitation(options as O, additionalFields),
		cancelAppInvitation: cancelAppInvitation(options as O, additionalFields),
		listAppInvitations: listAppInvitations(options as O, additionalFields),
	};
	const endpointPaths = Object.values(endpoints).map((e) => e.path);

	return {
		id: "app-invite",
		endpoints,
		rateLimit: [
			{
				pathMatcher(path) {
					return endpointPaths.some((e) => path.startsWith(e));
				},
				...options.rateLimit,
			},
		],
		schema: {
			appInvitation: {
				modelName: options.schema?.appInvitation?.modelName,
				fields: {
					inviterId: {
						fieldName: options.schema?.appInvitation?.fields?.inviterId,
						type: "string",
						required: true,
						references: {
							model: "user",
							field: "id",
						},
					},
					name: {
						fieldName: options.schema?.appInvitation?.fields?.name,
						type: "string",
						required: false,
						input: true,
					},
					email: {
						fieldName: options.schema?.appInvitation?.fields?.email,
						type: "string",
						required: false,
						input: true,
					},
					status: {
						fieldName: options.schema?.appInvitation?.fields?.status,
						type: [
							"pending",
							"accepted",
							"rejected",
							"canceled",
							"expired",
						] as const,
						required: true,
						defaultValue: "pending",
					},
					expiresAt: {
						fieldName: options.schema?.appInvitation?.fields?.expiresAt,
						type: "date",
						required: false,
					},
					domainWhitelist: {
						fieldName: options.schema?.appInvitation?.fields?.domainWhitelist,
						type: "string",
						required: false,
					},
					...(options.schema?.appInvitation?.additionalFields || {}),
				},
			},
		},
		$Infer: {
			AppInvitation: {} as AppInvitation &
				typeof additionalFields.appInvitation.$ReturnAdditionalFields,
		},
		$ERROR_CODES: APP_INVITE_ERROR_CODES,
	} satisfies BetterAuthPlugin;
};

export * from "./types";
export * from "./client";
