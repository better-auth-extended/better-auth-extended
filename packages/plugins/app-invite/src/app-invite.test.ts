import { describe, expect, it, vi } from "vitest";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { appInvite } from "./index";
import { appInviteClient } from "./client";
import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { APP_INVITE_ERROR_CODES } from "./error-codes";

const mockFn = vi.fn();
describe("App Invite", async () => {
	const {
		auth,
		client,
		signUpWithTestUser,
		sessionSetter,
		db,
		customFetchImpl,
		signInWithUser,
	} = await getTestInstance({
		options: {
			account: {
				fields: {
					providerId: "provider_id",
					accountId: "account_id",
				},
			},
			user: {
				additionalFields: {
					newField: {
						type: "string",
						defaultValue: "default-value",
					},
					nonRequiredField: {
						type: "string",
						required: false,
					},
				},
			},
			emailAndPassword: {
				enabled: true,
				autoSignIn: true,
			},
			plugins: [
				appInvite({
					autoSignIn: true,
					canCreateInvitation: (ctx) => {
						return ctx.context.session?.user.email !== "test7@test.com";
					},
					sendInvitationEmail: async (data, request) => {
						mockFn(data);
					},
					schema: {
						appInvitation: {
							additionalFields: {
								newInviteField: {
									type: "string",
									required: true,
								},
								nonRequiredInviteField: {
									type: "string",
									required: false,
								},
							},
						},
						user: {
							additionalFields: {
								newField: {
									type: "string",
									required: true,
								},
								nonRequiredField: {
									type: "string",
									required: false,
								},
							},
						},
					},
				}),
			],
		},
		clientOptions: {
			plugins: [
				appInviteClient({
					schema: {
						appInvitation: {
							additionalFields: {
								newInviteField: {
									type: "string",
									required: true,
								},
								nonRequiredInviteField: {
									type: "string",
									required: false,
								},
							},
						},
						user: {
							additionalFields: {
								newField: {
									type: "string",
									required: true,
								},
								nonRequiredField: {
									type: "string",
									required: false,
								},
							},
						},
					},
				}),
				inferAdditionalFields({
					user: {
						newField: {
							type: "string",
						},
						nonRequiredField: {
							type: "string",
							required: false,
						},
					},
				}),
			],
		},
	});
	const context = await auth.$context;
	const user = await signUpWithTestUser();

	describe("Sign up with invitation", () => {
		it("should work with additional fields on the user table", async () => {
			const invitation = await auth.api.createAppInvitation({
				headers: user.headers,
				body: {
					type: "personal",
					email: "email1@test.com",
					name: "Test User",
					additionalFields: {
						newInviteField: "",
						nonRequiredInviteField: "",
					},
				},
			});
			const headers = new Headers();
			const res = await client.acceptInvitation(
				{
					invitationId: invitation.id,
					password: "password",
					additionalFields: {
						newField: "new-field",
					},
				},
				{
					onSuccess: sessionSetter(headers),
				},
			);

			expect(res.data?.token).toBeDefined();
			expect(res.data?.user.email).toBe("email1@test.com");
			expect(res.data?.user.name).toBe("Test User");
			const accounts = await context.internalAdapter.findAccountByUserId(
				res.data!.user.id,
			);
			expect(accounts).toHaveLength(1);

			const session = await client.getSession({
				fetchOptions: {
					headers,
					throw: true,
				},
			});
			expect(session?.user.newField).toBe("new-field");
		});
		it("should work with custom fields on account table", async () => {
			const invitation = await auth.api.createAppInvitation({
				headers: user.headers,
				body: {
					type: "personal",
					email: "email2@test.com",
					additionalFields: {
						newInviteField: "",
						nonRequiredInviteField: "",
					},
				},
			});
			const res = await auth.api.acceptAppInvitation({
				body: {
					invitationId: invitation.id,
					name: "Test Name",
					password: "password",
					additionalFields: {
						newField: "",
						nonRequiredField: "",
					},
				},
			});
			expect(res.token).toBeDefined();
			const accounts = await context.internalAdapter.findAccountByUserId(
				res.user.id,
			);
			expect(accounts).toHaveLength(1);
		});
		it("should not work with invalid invitation", async () => {
			const res = await auth.api
				.acceptAppInvitation({
					body: {
						invitationId: "not a valid id",
						name: "Test Name",
						password: "password",
						additionalFields: {
							newField: "",
							nonRequiredField: "",
						},
					},
				})
				.catch((e) => {});
			expect(res).toBeUndefined();
		});
	});

	const client2 = createAuthClient({
		baseURL: "http://localhost:3000",
		plugins: [
			appInviteClient({
				schema: {
					appInvitation: {
						additionalFields: {
							newInviteField: {
								type: "string",
								required: true,
							},
							nonRequiredInviteField: {
								type: "string",
								required: false,
							},
						},
					},
					user: {
						additionalFields: {
							newField: {
								type: "string",
								required: true,
							},
							nonRequiredField: {
								type: "string",
								required: false,
							},
						},
					},
				},
			}),
		],
		fetchOptions: {
			customFetchImpl,
		},
	});

	it("should allow inviting users to the application", async () => {
		const newUser = {
			email: "test3@test.com",
		};
		const invite = await client.inviteUser({
			type: "personal",
			email: newUser.email,
			additionalFields: {
				newInviteField: "",
				nonRequiredInviteField: "",
			},
			fetchOptions: {
				headers: user.headers,
			},
		});
		if (!invite.data) throw new Error("Invitation not created");
		expect(invite.data.email).toBe(newUser.email);
	});

	describe("should allow inviting multiple users with a single link", async () => {
		const invitation = await auth.api.createAppInvitation({
			body: {
				type: "public",
				domainWhitelist: "test*.com",
				additionalFields: {
					newInviteField: "",
					nonRequiredInviteField: "",
				},
			},
			headers: user.headers,
		});
		if (!invitation) {
			throw new Error("Couldn't create invitation");
		}
		expect(invitation?.status).toBe("pending");

		it.each(
			[
				{
					invitee: {
						name: "Test User #1",
						email: "test-user-1@test.com",
						password: "password123456",
					},
					action: "accept-invitation",
					message: "$name should be able to accept the invitation",
				},
				{
					invitee: {
						name: "Test User #2",
						email: "test-user-2@test2.com",
						password: "password123456",
					},
					action: "accept-invitation",
					message: "$name should be able to accept the invitation",
				},
				{
					invitee: {
						name: "Test User #3",
						email: "test-user-3@example.com",
						password: "password123456",
					},
					action: "accept-invitation-expect-error",
					message:
						"$name should not be able to accept the invitation (domain not in whitelist)",
				},
				{
					action: "reject-invitation",
					message: "should not allow to reject the invitation",
				},
			].map(({ action, message, ...data }) => [
				`${message?.replaceAll(/\$name/g, () => `'${data.invitee?.name}'`) || action}`,
				action,
				data,
			]),
		)("%s", async (_, action, { invitee }) => {
			switch (action) {
				case "accept-invitation-expect-error":
				case "accept-invitation": {
					if (!invitee) {
						throw new Error("No invitee defined");
					}
					const res = await client2.acceptInvitation({
						invitationId: invitation.id,
						name: invitee.name,
						email: invitee.email,
						password: invitee.password,
						additionalFields: {
							newField: "new-field",
						},
					});
					if (action === "accept-invitation") {
						expect(res.data?.user.email).toBe(invitee.email);
					}
					if (action === "accept-invitation-expect-error") {
						expect(res.error?.message).toBe(
							APP_INVITE_ERROR_CODES.EMAIL_DOMAIN_IS_NOT_IN_WHITELIST,
						);
					}
					break;
				}
				case "reject-invitation": {
					const res = await client2.rejectInvitation({
						invitationId: invitation.id,
					});
					expect(res.error?.code).toBe("THIS_APP_INVITATION_CANT_BE_REJECTED");
					break;
				}
			}
		});
	});

	it("should allow canceling an invitation issued by the user", async () => {
		const newUser = {
			email: "test4@test.com",
		};
		const invite = await client2.inviteUser({
			type: "personal",
			email: newUser.email,
			additionalFields: {
				newInviteField: "",
			},
			fetchOptions: {
				headers: user.headers,
			},
		});
		if (!invite.data) {
			throw new Error("Invitation not created");
		}
		expect(invite.data.email).toBe(newUser.email);

		const res = await client2.cancelInvitation({
			invitationId: invite.data.id,
			fetchOptions: {
				headers: user.headers,
			},
		});
		if (!res.data) {
			throw new Error("Invitation not canceled");
		}
		expect(res.data.status).toBe("canceled");
	});

	it("should not allow canceling an invitation issued by another user", async () => {
		const isUserSignedUp = await client2.signUp.email({
			email: "test5@test.com",
			name: "Test Name",
			password: "password123456",
		});
		if (isUserSignedUp.error) {
			throw new Error("Could't create test user");
		}
		const anotherUser = await signInWithUser(
			"test5@test.com",
			"password123456",
		);

		const newUser = {
			email: "test6@test.com",
		};
		const invite = await client2.inviteUser({
			type: "personal",
			email: newUser.email,
			additionalFields: {
				newInviteField: "",
			},
			fetchOptions: {
				headers: user.headers,
			},
		});
		if (!invite.data) {
			throw new Error("Invitation not created");
		}
		expect(invite.data.email).toBe(newUser.email);

		const res = await client2.cancelInvitation({
			invitationId: invite.data.id,
			fetchOptions: {
				headers: anotherUser.headers,
			},
		});
		expect(res.error?.status).toBe(403);
	});

	it("should allow disabling sending invitations based on the issuer", async () => {
		const isUserSignedUp = await client2.signUp.email({
			email: "test7@test.com",
			name: "Test Name",
			password: "password123456",
		});
		if (isUserSignedUp.error) {
			throw new Error("Could't create test user");
		}
		const anotherUser = await signInWithUser(
			"test7@test.com",
			"password123456",
		);
		const res = await client2.inviteUser({
			type: "personal",
			email: "test8@test.com",
			additionalFields: {
				newInviteField: "",
			},
			fetchOptions: {
				headers: anotherUser.headers,
			},
		});
		expect(res.error?.status).toBe(403);
	});

	it("should allow listing invitations issued by the user", async () => {
		const res = await client2.listInvitations({
			query: {
				limit: 2,
			},
			fetchOptions: {
				headers: user.headers,
			},
		});
		expect(res.data?.invitations.length).toBeGreaterThanOrEqual(1);
	});

	it("should remove expired invitations when cleanupExpiredInvitations is true", async () => {
		const invitation = await auth.api.createAppInvitation({
			headers: user.headers,
			body: {
				type: "personal",
				email: "expired@test.com",
				additionalFields: {
					newInviteField: "",
				},
			},
		});

		await db.update({
			model: "appInvitation",
			where: [{ field: "id", value: invitation.id }],
			update: { expiresAt: new Date(Date.now() - 1000) },
		});

		const res = await client2.listInvitations({
			query: {},
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(
			res.data?.invitations.find((inv) => inv.id === invitation.id),
		).toBeUndefined();
	});

	it("should keep expired invitations when cleanupExpiredInvitations is false", async () => {
		const {
			auth: _auth,
			client: _client,
			signUpWithTestUser,
			db: _db,
		} = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					appInvite({
						cleanupExpiredInvitations: false,
						sendInvitationEmail: async () => {},
					}),
				],
			},
			clientOptions: {
				plugins: [appInviteClient()],
			},
		});

		const user = await signUpWithTestUser();

		const invitation = await _auth.api.createAppInvitation({
			headers: user.headers,
			body: {
				type: "personal",
				email: "expired-keep@test.com",
			},
		});

		await _db.update({
			model: "appInvitation",
			where: [{ field: "id", value: invitation.id }],
			update: { expiresAt: new Date(Date.now() - 1000) },
		});

		const res = await _client.listInvitations({
			query: {},
			fetchOptions: {
				headers: user.headers,
			},
		});

		const expiredInvitation = res.data?.invitations.find(
			(inv) => inv.id === invitation.id,
		);
		expect(expiredInvitation).toBeDefined();
		expect(expiredInvitation?.status).toBe("expired");

		const acceptRes = await _client.acceptInvitation({
			invitationId: invitation.id,
			name: "Test User",
			password: "password",
		});

		expect(acceptRes.error).toBeDefined();
	});

	it("should delete personal invites on decision when cleanupPersonalInvitesOnDecision is true", async () => {
		const {
			auth: _auth,
			client: _client,
			signUpWithTestUser,
			db: _db,
		} = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					appInvite({
						cleanupPersonalInvitesOnDecision: true,
						sendInvitationEmail: async () => {},
					}),
				],
			},
			clientOptions: {
				plugins: [appInviteClient()],
			},
		});

		const _user = await signUpWithTestUser();

		const invitation1 = await _auth.api.createAppInvitation({
			headers: _user.headers,
			body: {
				type: "personal",
				email: "multiple@test.com",
				resend: true,
			},
		});

		const invitation2 = await _auth.api.createAppInvitation({
			headers: _user.headers,
			body: {
				type: "personal",
				email: "multiple@test.com",
				resend: true,
			},
		});

		let res = await _client.listInvitations({
			query: {},
			fetchOptions: {
				headers: _user.headers,
			},
		});

		expect(
			res.data?.invitations.filter((inv) => inv.email === "multiple@test.com"),
		).toHaveLength(2);

		await _client.acceptInvitation({
			invitationId: invitation1.id,
			name: "Test User",
			password: "password",
			additionalFields: {
				newField: "test",
			},
		});

		res = await _client.listInvitations({
			query: {},
			fetchOptions: {
				headers: _user.headers,
			},
		});

		const remainingInvitations = res.data?.invitations.filter(
			(inv) => inv.email === "multiple@test.com",
		);
		expect(remainingInvitations).toHaveLength(0);
	});

	it("should keep personal invites on decision when cleanupPersonalInvitesOnDecision is false", async () => {
		const {
			auth: _auth,
			client: _client,
			signUpWithTestUser,
			db: _db,
		} = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					appInvite({
						cleanupPersonalInvitesOnDecision: false,
						sendInvitationEmail: async () => {},
					}),
				],
			},
			clientOptions: {
				plugins: [appInviteClient()],
			},
		});

		const _user = await signUpWithTestUser();

		const invitation1 = await _auth.api.createAppInvitation({
			headers: _user.headers,
			body: {
				type: "personal",
				email: "multiple-keep@test.com",
				resend: true,
			},
		});

		const invitation2 = await _auth.api.createAppInvitation({
			headers: _user.headers,
			body: {
				type: "personal",
				email: "multiple-keep@test.com",
				resend: true,
			},
		});

		let res = await _client.listInvitations({
			query: {},
			fetchOptions: {
				headers: _user.headers,
			},
		});

		expect(
			res.data?.invitations.filter(
				(inv) => inv.email === "multiple-keep@test.com",
			),
		).toHaveLength(2);

		await _client.acceptInvitation({
			invitationId: invitation1.id,
			name: "Test User",
			password: "password",
		});

		res = await _client.listInvitations({
			query: {},
			fetchOptions: {
				headers: _user.headers,
			},
		});

		const remainingInvitations = res.data?.invitations.filter(
			(inv) => inv.email === "multiple-keep@test.com",
		);
		expect(
			remainingInvitations?.find((i) => i.id === invitation1.id)?.status,
		).toBe("accepted");
		expect(
			remainingInvitations?.find((i) => i.id === invitation2.id)?.status,
		).toBe("expired");
	});
});
