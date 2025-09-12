import { createAuthEndpoint } from "better-auth/plugins";
import type { AppInviteOptions } from "../types";
import { z } from "zod";
import { APIError, originCheck } from "better-auth/api";
import { getAppInviteAdapter } from "../adapter";
import { APP_INVITE_ERROR_CODES } from "../error-codes";
import type { AppInvitation } from "../schema";
import type { AdditionalPluginFields } from "../utils";

export const rejectAppInvitation = <O extends AppInviteOptions>(
	options: O,
	additionalFields: AdditionalPluginFields<O>,
) => {
	type ReturnAdditionalFields =
		typeof additionalFields.appInvitation.$ReturnAdditionalFields;

	return createAuthEndpoint(
		"/reject-invitation",
		{
			method: "POST",
			query: z
				.object({
					callbackURL: z
						.string()
						.meta({
							description:
								"The URL to redirect to after rejecting the invitation",
						})
						.optional(),
				})
				.optional(),
			body: z.object({
				invitationId: z.string().meta({
					description: "The ID of the invitation",
				}),
			}),
			use: [originCheck((ctx) => ctx.query?.callbackURL)],
			metadata: {
				openapi: {
					operationId: "rejectAppInvitation",
					description: "Reject an app invitation",
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
										type: "object",
										properties: {
											token: {
												type: "null",
											},
											invitation: {
												$ref: "#/components/schemas/AppInvitation",
											},
											user: {
												type: "null",
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			if (ctx.context.session?.session) {
				throw new APIError("FORBIDDEN");
			}
			const adapter = getAppInviteAdapter(ctx.context, options);
			let invitation = await adapter.findInvitationById(ctx.body.invitationId, {
				where: [
					{
						field: "status",
						value: "pending",
					},
				],
			});
			const type = !invitation?.email ? "public" : "personal";
			const isExpired = invitation?.expiresAt
				? invitation?.expiresAt < new Date()
				: false;
			if (!invitation || isExpired) {
				if (isExpired && invitation) {
					if (options.cleanupExpiredInvitations) {
						await adapter.deleteInvitation(invitation.id);
					} else {
						await adapter.updateInvitation(invitation.id, "expired");
					}
				}
				throw new APIError("BAD_REQUEST", {
					message: APP_INVITE_ERROR_CODES.APP_INVITATION_NOT_FOUND,
				});
			}
			if (type === "public") {
				throw new APIError("BAD_REQUEST", {
					message: APP_INVITE_ERROR_CODES.THIS_APP_INVITATION_CANT_BE_REJECTED,
				});
			}

			await options.hooks?.reject?.before?.(ctx, invitation);

			let rejectedI: AppInvitation | null = invitation;
			if (options.cleanupPersonalInvitesOnDecision) {
				await adapter.deleteInvitation(invitation.id);
			} else {
				rejectedI = await adapter.updateInvitation(invitation.id, "rejected");
			}

			rejectedI = rejectedI
				? {
						...rejectedI,
						status: "rejected",
					}
				: null;

			if (!rejectedI) {
				throw ctx.error("INTERNAL_SERVER_ERROR");
			}

			await options.hooks?.reject?.after?.(ctx, rejectedI);

			return ctx.json({
				token: null,
				invitation: rejectedI as
					| (AppInvitation & ReturnAdditionalFields)
					| null,
				user: null,
			});
		},
	);
};
