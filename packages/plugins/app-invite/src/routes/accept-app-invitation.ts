import { createAuthEndpoint } from "better-auth/plugins";
import type { AppInviteOptions } from "../types";
import { z } from "zod";
import { type InferFieldsInput, parseUserInput, toZodSchema } from "better-auth/db";
import { getAppInviteAdapter } from "../adapter";
import type { getAdditionalFields } from "../utils";
import { APIError, createEmailVerificationToken, originCheck } from "better-auth/api";
import { BASE_ERROR_CODES, APP_INVITE_ERROR_CODES } from "../error-codes";
import type { User } from "better-auth";
import type { AppInvitation } from "../schema";
import { setSessionCookie } from "better-auth/cookies";
import { isDevelopment } from "@better-auth-extended/internal-env";
import { matchWildcard, type IsExactlyEmptyObject } from "@better-auth-extended/internal-utils";

export const acceptAppInvitation = <
	O extends AppInviteOptions,
	A extends ReturnType<typeof getAdditionalFields<O>>,
>(
	options: O,
	{ $ReturnAdditionalFields }: A,
) => {
	type AdditionalFields = O["schema"] extends {
		user: {
			additionalFields: infer Field;
		};
	}
		? InferFieldsInput<Field>
		: {};

	type ReturnAdditionalFields = typeof $ReturnAdditionalFields;

	return createAuthEndpoint(
		"/accept-invitation",
		{
			method: "POST",
			query: z
				.object({
					callbackURL: z
						.string()
						.meta({
							description: "The URL to redirect to after accepting the invitation",
						})
						.optional(),
				})
				.optional(),
			body: z.object({
				invitationId: z.string().meta({
					description: "The ID of the invitation",
				}),
				name: z.string().optional(),
				email: z.email().optional(),
				password: z.string(),
				additionalFields: z
					.object({
						...(options.schema?.user?.additionalFields
							? toZodSchema({
									fields: options.schema?.user?.additionalFields,
									isClientSide: true,
								}).shape
							: {}),
					})
					.optional(),
			}),
			use: [originCheck((ctx) => ctx.query?.callbackURL)],
			metadata: {
				$Infer: {
					body: {} as {
						invitationId: string;

						name?: string;
						email?: string;
						password: string;
					} & (IsExactlyEmptyObject<AdditionalFields> extends true
						? { additionalFields?: {} }
						: { additionalFields: AdditionalFields }),
				},
				openapi: {
					operationId: "acceptAppInvitation",
					description: "Accept an app invitation that has been issued by another user",
					requestBody: {
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										invitationId: {
											type: "string",
											description: "The ID of the invitation",
										},
										name: {
											type: "string",
											description: "The name of the user",
										},
										email: {
											type: "string",
											description: "The email address of the user",
										},
										password: {
											type: "string",
											description: "The password of the user",
										},
									},
									required: ["invitationId", "password"],
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
												type: "string",
											},
											invitation: {
												$ref: "#/components/schemas/AppInvitation",
											},
											user: {
												$ref: "#/components/schemas/User",
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

			const invitation = await adapter.findInvitationById(ctx.body.invitationId, {
				where: [
					{
						field: "status",
						value: "pending",
					},
				],
			});
			const isExpired = invitation?.expiresAt ? invitation?.expiresAt < new Date() : false;
			if (!invitation || isExpired) {
				if (isExpired && options.cleanupExpiredInvitations && invitation) {
					await adapter.deleteInvitation(invitation.id);
				}
				throw new APIError("BAD_REQUEST", {
					message: APP_INVITE_ERROR_CODES.APP_INVITATION_NOT_FOUND,
				});
			}

			const invitationType = invitation.email ? "personal" : "public";

			const inviter = await ctx.context.internalAdapter.findUserById(invitation.inviterId);
			if (!inviter) {
				throw new APIError("BAD_REQUEST", {
					message:
						APP_INVITE_ERROR_CODES.INVITER_IS_NO_LONGER_A_MEMBER_OF_THIS_APPLICATION,
				});
			}

			let userData = {
				name: invitation.name || ctx.body.name,
				email: invitation.email || ctx.body.email,
				...ctx.body.additionalFields,
			} as User & Record<string, any>;

			const dbUser = await ctx.context.internalAdapter.findUserByEmail(userData.email);
			if (dbUser?.user) {
				ctx.context.logger.info(`Sign-up attempt for existing email: ${userData.email}`);
				throw new APIError("UNPROCESSABLE_ENTITY", {
					message: BASE_ERROR_CODES.USER_ALREADY_EXISTS,
				});
			}

			const before = await options.hooks?.accept?.before?.(ctx, userData);
			if (before?.user) {
				userData = before.user;
			}
			const isValidEmail = z.email().safeParse(userData.email);

			if (!isValidEmail.success) {
				throw new APIError("BAD_REQUEST", {
					message: BASE_ERROR_CODES.INVALID_EMAIL,
				});
			}

			if (invitationType === "public") {
				const [_lP, domain] = userData.email.split("@");

				const domainWhitelist = invitation.domainWhitelist?.split(",");

				const isMatch = matchWildcard(domain.trim().toLowerCase(), ".");
				if (
					domainWhitelist?.length &&
					domainWhitelist.length > 0 &&
					!domainWhitelist.some((wDomain: string) =>
						isMatch(wDomain.trim().toLowerCase()),
					)
				) {
					throw new APIError("FORBIDDEN", {
						message: APP_INVITE_ERROR_CODES.EMAIL_DOMAIN_IS_NOT_IN_WHITELIST,
					});
				}
			}

			const minPasswordLength = ctx.context.password.config.minPasswordLength;
			if (ctx.body.password.length < minPasswordLength) {
				ctx.context.logger.error("Password is too short");
				throw new APIError("BAD_REQUEST", {
					message: BASE_ERROR_CODES.PASSWORD_TOO_SHORT,
				});
			}
			const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
			if (ctx.body.password.length > maxPasswordLength) {
				ctx.context.logger.error("Password is too long");
				throw new APIError("BAD_REQUEST", {
					message: BASE_ERROR_CODES.PASSWORD_TOO_LONG,
				});
			}

			const additionalData = parseUserInput(ctx.context.options, ctx.body.additionalFields);
			const hash = await ctx.context.password.hash(ctx.body.password);
			let createdUser: User;
			try {
				createdUser = await ctx.context.internalAdapter.createUser({
					email: userData.email.toLowerCase(),
					name: userData.name,
					...additionalData,
					emailVerified: options.verifyEmailOnAccept,
				});
				if (!createdUser) {
					throw new APIError("UNPROCESSABLE_ENTITY", {
						message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER,
					});
				}
			} catch (e) {
				if (isDevelopment) {
					ctx.context.logger.error("Failed to create user", e);
				}
				if (e instanceof APIError) {
					throw e;
				}
				throw new APIError("UNPROCESSABLE_ENTITY", {
					message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER,
					details: e,
				});
			}
			if (!createdUser) {
				throw new APIError("UNPROCESSABLE_ENTITY", {
					message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER,
				});
			}

			await ctx.context.internalAdapter.linkAccount(
				{
					userId: createdUser.id,
					providerId: "credential",
					accountId: createdUser.id,
					password: hash,
				},
				ctx,
			);

			let acceptedI: AppInvitation | null = invitation;
			if (invitationType === "personal") {
				if (options.cleanupPersonalInvitesOnDecision) {
					await adapter.deleteInvitation(invitation.id);
				} else {
					acceptedI = await adapter.updateInvitation(invitation.id, "accepted");
				}
			}

			await options.hooks?.accept?.after?.(ctx, {
				invitation: acceptedI!,
				user: createdUser,
			});

			if (!options.verifyEmailOnAccept) {
				if (
					ctx.context.options.emailVerification?.sendOnSignUp ||
					ctx.context.options.emailAndPassword?.requireEmailVerification
				) {
					const token = await createEmailVerificationToken(
						ctx.context.secret,
						createdUser.email,
						undefined,
						ctx.context.options.emailVerification?.expiresIn,
					);
					const url = `${
						ctx.context.baseURL
					}/verify-email?token=${token}&callbackURL=${ctx.query?.callbackURL || "/"}`;
					await ctx.context.options.emailVerification?.sendVerificationEmail?.(
						{
							user: createdUser,
							url,
							token,
						},
						ctx.request,
					);
				}

				if (ctx.context.options.emailAndPassword?.requireEmailVerification) {
					return ctx.json({
						token: null,
						user: {
							id: createdUser.id,
							email: createdUser.email,
							name: createdUser.name,
							image: createdUser.image,
							emailVerified: createdUser.emailVerified,
							createdAt: createdUser.createdAt,
							updatedAt: createdUser.updatedAt,
						},
						invitation: acceptedI as (AppInvitation & ReturnAdditionalFields) | null,
					});
				}
			}

			if (!options?.autoSignIn) {
				return ctx.json({
					token: null,
					user: {
						id: createdUser.id,
						email: createdUser.email,
						name: createdUser.name,
						image: createdUser.image,
						emailVerified: createdUser.emailVerified,
						createdAt: createdUser.createdAt,
						updatedAt: createdUser.updatedAt,
					},
					invitation: acceptedI as (AppInvitation & ReturnAdditionalFields) | null,
				});
			}

			const session = await ctx.context.internalAdapter.createSession(createdUser.id, ctx);
			if (!session) {
				throw new APIError("BAD_REQUEST", {
					message: BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION,
				});
			}
			await setSessionCookie(ctx, {
				session,
				user: createdUser,
			});
			if (!ctx.query?.callbackURL) {
				return ctx.json({
					token: session.token,
					user: {
						id: createdUser.id,
						email: createdUser.email,
						name: createdUser.name,
						image: createdUser.image,
						emailVerified: createdUser.emailVerified,
						createdAt: createdUser.createdAt,
						updatedAt: createdUser.updatedAt,
					},
					invitation: acceptedI as (AppInvitation & ReturnAdditionalFields) | null,
				});
			}
			throw ctx.redirect(ctx.query.callbackURL);
		},
	);
};
