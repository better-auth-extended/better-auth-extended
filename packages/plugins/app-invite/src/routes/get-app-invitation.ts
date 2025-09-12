import { createAuthEndpoint } from "better-auth/plugins";
import type { AppInviteOptions } from "../types";
import { z } from "zod";
import { getAppInviteAdapter } from "../adapter";
import { APIError } from "better-auth/api";
import { APP_INVITE_ERROR_CODES } from "../error-codes";
import type { AdditionalPluginFields } from "../utils";

export const getAppInvitation = <O extends AppInviteOptions>(
	options: O,
	additionalFields: AdditionalPluginFields<O>,
) => {
	type ReturnAdditionalFields =
		typeof additionalFields.appInvitation.$ReturnAdditionalFields;

	return createAuthEndpoint(
		"/get-app-invitation",
		{
			method: "GET",
			query: z.object({
				id: z.string().meta({
					description: "The ID of the invitation to get.",
				}),
			}),
			metadata: {
				openapi: {
					operationId: "getAppInvitation",
					description: "Get an invitation by ID",
					responses: {
						"200": {
							description: "Success",
							content: {
								"application/json": {
									schema: {
										$ref: "#/components/schemas/AppInvitation",
										type: "object",
										properties: {
											id: {
												type: "string",
											},
											name: {
												type: "string",
											},
											email: {
												type: "string",
											},
											inviterId: {
												type: "string",
											},
											status: {
												type: "string",
											},
											domainWhitelist: {
												type: "string",
											},
											expiresAt: {
												type: "string",
											},
											inviterEmail: {
												type: "string",
											},
											inviterImage: {
												type: "string",
											},
										},
										required: ["id", "inviterId", "inviterEmail", "status"],
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const adapter = getAppInviteAdapter(ctx.context, options);
			const invitation =
				await adapter.findInvitationById<ReturnAdditionalFields>(ctx.query.id, {
					where: [
						{
							field: "status",
							value: "pending",
						},
					],
				});
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

			const inviter = await ctx.context.internalAdapter.findUserById(
				invitation.inviterId,
			);
			if (!inviter) {
				throw new APIError("BAD_REQUEST", {
					message:
						APP_INVITE_ERROR_CODES.INVITER_IS_NO_LONGER_A_MEMBER_OF_THIS_APPLICATION,
				});
			}

			const data = {
				...invitation,
				inviterEmail: inviter.email,
				inviterImage: inviter.image,
			};

			return data;
		},
	);
};
