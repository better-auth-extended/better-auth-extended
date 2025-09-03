import { createAuthEndpoint } from "better-auth/plugins";
import type { getAdditionalFields } from "../utils";
import type { AppInviteOptions } from "../types";
import { z } from "zod";
import { getAppInviteAdapter } from "../adapter";
import { APIError } from "better-auth";
import { APP_INVITE_ERROR_CODES } from "../error-codes";

export const getAppInvitation = <
	O extends AppInviteOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields }: A,
) => {
	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

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
											// TODO:
										},
										required: [
											// TODO:
										],
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
				if (isExpired && options.cleanupExpiredInvitations && invitation) {
					await adapter.deleteInvitation(invitation.id);
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
