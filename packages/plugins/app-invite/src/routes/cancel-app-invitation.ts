import { APIError, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import type { AppInviteOptions } from "../types";
import { getAppInviteAdapter } from "../adapter";
import { APP_INVITE_ERROR_CODES } from "../error-codes";
import type { getAdditionalFields } from "../utils";
import type { AppInvitation } from "../schema";

export const cancelAppInvitation = <
	O extends AppInviteOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields }: A,
) => {
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

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
			const canCancel = options.allowUserToCancelInvitation
				? await options.allowUserToCancelInvitation({
						user: session.user,
						invitation,
					})
				: typeof options.canCancelInvitation === "function"
					? await options.canCancelInvitation(ctx, invitation)
					: options.canCancelInvitation;
			if (!canCancel) {
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

			await options.hooks?.cancel?.after?.(ctx, canceledI!);

			return ctx.json(
				canceledI as (AppInvitation & ReturnAdditionalFields) | null,
			);
		},
	);
};
