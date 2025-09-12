import { APIError, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import type { AppInviteOptions } from "../types";
import { APP_INVITE_ERROR_CODES } from "../error-codes";
import { getAppInviteAdapter } from "../adapter";
import {
	type AppInvitation,
	type CreateInvitation,
	createInvitationSchema,
} from "../schema";
import { z } from "zod";
import type {
	IsExactlyEmptyObject,
	Merge,
} from "@better-auth-extended/internal-utils";
import type { AdditionalPluginFields } from "../utils";

export const createAppInvitation = <
	O extends AppInviteOptions,
	S extends boolean,
>(
	options: O,
	additionalFields: AdditionalPluginFields<O>,
) => {
	type AdditionalFields =
		typeof additionalFields.appInvitation.$AdditionalFields;
	type ReturnAdditionalFields =
		typeof additionalFields.appInvitation.$ReturnAdditionalFields;

	return createAuthEndpoint(
		"/invite-user",
		{
			method: "POST",
			use: [sessionMiddleware],
			body: createInvitationSchema.and(
				z.object({
					additionalFields: z
						.object({
							...additionalFields.appInvitation.additionalFieldsSchema.shape,
						})
						.optional(),
				}),
			),
			metadata: {
				$Infer: {
					body: {} as (S extends true
						? CreateInvitation
						: Merge<CreateInvitation>) &
						(IsExactlyEmptyObject<AdditionalFields> extends true
							? { additionalFields?: {} }
							: { additionalFields: AdditionalFields }),
				},
				openapi: {
					operationId: "createAppInvitation",
					description: "Invite a user to the app",
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
		},
		async (ctx) => {
			if (ctx.body.type === "personal" && !options.sendInvitationEmail) {
				ctx.context.logger.warn(
					"Invitation email is not enabled. Pass `sendInvitationEmail` to the plugin options to enable it.",
				);
				throw new APIError("BAD_REQUEST", {
					message: "Invitation email is not enabled",
				});
			}

			const session = ctx.context.session;
			const canInvite = options.allowUserToCreateInvitation
				? typeof options.allowUserToCreateInvitation === "function"
					? await options.allowUserToCreateInvitation(
							session.user,
							ctx.body.type,
						)
					: options.allowUserToCreateInvitation
				: ((typeof options.canCreateInvitation === "function"
						? await options.canCreateInvitation(ctx)
						: options.canCreateInvitation) ?? true);

			if (!canInvite) {
				throw new APIError("FORBIDDEN", {
					message:
						APP_INVITE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_APPLICATION,
				});
			}

			const adapter = getAppInviteAdapter(ctx.context, options);
			if (ctx.body.type === "personal") {
				if (!ctx.body.email) {
					throw new APIError("BAD_REQUEST", {
						message: "Missing required field.",
					});
				}
				const alreadyMember = await ctx.context.internalAdapter.findUserByEmail(
					ctx.body.email,
				);
				if (alreadyMember) {
					throw new APIError("BAD_REQUEST", {
						message:
							APP_INVITE_ERROR_CODES.USER_IS_ALREADY_A_MEMBER_OF_THIS_APPLICATION,
					});
				}
				const alreadyInvited = await adapter.findInvitationByEmail(
					ctx.body.email,
					{
						where: [
							{
								field: "status",
								value: "pending",
							},
						],
					},
				);
				if (alreadyInvited && !ctx.body.resend) {
					throw new APIError("BAD_REQUEST", {
						message:
							APP_INVITE_ERROR_CODES.USER_WAS_ALREADY_INVITED_TO_THIS_APPLICATION,
					});
				}
			}

			await options.hooks?.create?.before?.(ctx);

			if (
				ctx.body.type === "personal" &&
				ctx.body.resend &&
				options.resendExistingInvite
			) {
				const pendingInvitations =
					await adapter.findInvitationsByEmail<ReturnAdditionalFields>(
						ctx.body.email,
						{
							where: [
								{
									field: "inviterId",
									value: session.user.id,
								},
								{
									field: "status",
									value: "pending",
								},
							],
						},
					);

				const invitation = pendingInvitations.reduce(
					(acc, current) => {
						if (!acc) {
							return current;
						}

						if (!acc.expiresAt) {
							return acc;
						}

						if (!current.expiresAt) {
							return current;
						}

						return current.expiresAt > acc.expiresAt ? current : acc;
					},
					null as (AppInvitation & ReturnAdditionalFields) | null,
				);

				if (invitation?.email) {
					await options.sendInvitationEmail?.(
						{
							...invitation,
							type: "personal",
							inviter: session.user,
						},
						ctx.request,
					);

					await options.hooks?.create?.after?.(ctx, invitation);

					return invitation;
				}
			}

			const invitation = await adapter.createInvitation<ReturnAdditionalFields>(
				ctx.body,
				session.user,
			);

			if (invitation.email && ctx.body.type === "personal") {
				await options.sendInvitationEmail?.(
					{
						...invitation,
						type: ctx.body.type,
						inviter: session.user,
					},
					ctx.request,
				);
			}

			await options.hooks?.create?.after?.(ctx, invitation);

			return invitation;
		},
	);
};
