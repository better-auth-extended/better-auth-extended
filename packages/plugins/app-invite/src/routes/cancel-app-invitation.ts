import { APIError, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import type { AppInviteOptions } from "../types";
import { getAppInviteAdapter } from "../adapter";
import { APP_INVITE_ERROR_CODES } from "../error-codes";
import type { AppInvitation } from "../schema";
import { checkPermission, type AdditionalPluginFields } from "../utils";

export const cancelAppInvitation = <O extends AppInviteOptions>(
	options: O,
	additionalFields: AdditionalPluginFields<O>,
) => {
	type ReturnAdditionalFields =
		typeof additionalFields.appInvitation.$ReturnAdditionalFields;

	return createAuthEndpoint(
		"/cancel-invitation",
		{
			method: "POST",
			body: z.object({
				invitationId: z.string().meta({
					description: "The ID of the app invitation to cancel",
				}),
			}),
			use: [sessionMiddleware],
			metadata: {
				operationId: "cancelAppInvitation",
				description: "Cancel an app invitation",
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									invitationId: {
										type: "string",
									},
								},
								required: ["invitationId"],
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/AppInvitation",
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const session = ctx.context.session;
			const adapter = getAppInviteAdapter(ctx.context, options);
			const invitation = await adapter.findInvitationById(
				ctx.body.invitationId,
				{
					where: [
						{
							field: "status",
							value: "pending",
						},
					],
				},
			);
			if (!invitation) {
				throw new APIError("BAD_REQUEST", {
					message: APP_INVITE_ERROR_CODES.APP_INVITATION_NOT_FOUND,
				});
			}
			let hasAccess: boolean = false;
			if (options.allowUserToCancelInvitation) {
				hasAccess =
					typeof options.allowUserToCancelInvitation === "function"
						? await options.allowUserToCancelInvitation({
								user: session.user,
								invitation,
							})
						: options.allowUserToCancelInvitation;
			} else if (options.canCancelInvitation) {
				const canCancel =
					typeof options.canCancelInvitation === "function"
						? await options.canCancelInvitation(ctx, invitation)
						: options.canCancelInvitation;
				hasAccess =
					typeof canCancel === "object"
						? await checkPermission(ctx, {
								[canCancel.statement]: canCancel.permissions,
							})
						: canCancel;
			}
			if (!hasAccess) {
				throw new APIError("FORBIDDEN", {
					message:
						APP_INVITE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_APP_INVITATION,
				});
			}

			await options.hooks?.cancel?.before?.(ctx, invitation);

			let canceledI: AppInvitation | null = invitation;
			if (options.cleanupPersonalInvitesOnDecision) {
				await adapter.deleteInvitation(invitation.id);
			} else {
				canceledI = await adapter.updateInvitation<ReturnAdditionalFields>(
					invitation.id,
					"canceled",
				);
			}

			canceledI = canceledI
				? {
						...canceledI,
						status: "canceled",
					}
				: null;

			if (!canceledI) {
				throw ctx.error("INTERNAL_SERVER_ERROR");
			}

			await options.hooks?.cancel?.after?.(ctx, canceledI);

			return ctx.json(
				canceledI as (AppInvitation & ReturnAdditionalFields) | null,
			);
		},
	);
};
