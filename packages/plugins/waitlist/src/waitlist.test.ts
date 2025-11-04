import { describe, it, expect, afterEach } from "vitest";
import { waitlist } from "../src/index";
import { waitlistClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { adminClient } from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
	defaultStatements,
	adminAc,
	userAc,
} from "better-auth/plugins/admin/access";
import { admin } from "better-auth/plugins/admin";

describe("Waitlist", async () => {
	const { auth, client, db, signUpWithTestUser, resetDatabase } =
		await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					waitlist({
						canCreateWaitlist(ctx) {
							return true;
						},
						canGetWaitlist(ctx) {
							return true;
						},
						canAcceptUser(ctx) {
							return true;
						},
						canRejectUser(ctx) {
							return true;
						},
					}),
				],
			},
			clientOptions: {
				plugins: [waitlistClient()],
			},
		});

	let user = await signUpWithTestUser();

	afterEach(async () => {
		await resetDatabase();
		user = await signUpWithTestUser();
	});

	it("should create a waitlist with max-signups-reached end event", async () => {
		const result = await auth.api.createWaitlist({
			headers: user.headers,
			body: {
				endEvent: "max-signups-reached",
				maxParticipants: 100,
			},
		});

		expect(result?.endEvent).toBe("max-signups-reached");
		expect(result?.maxParticipants).toBe(100);
		expect(result?.beginsAt).toBeDefined();
		expect(result?.id).toBeDefined();
	});

	it("should create a waitlist with date-reached end event", async () => {
		const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const result = await auth.api.createWaitlist({
			headers: user.headers,
			body: {
				endEvent: "date-reached",
				endsAt,
			},
		});

		expect(result?.endEvent).toBe("date-reached");
		expect(result?.beginsAt).toBeDefined();
		expect(result?.endsAt).toStrictEqual(endsAt);
		expect(result?.id).toBeDefined();
	});

	it("should create a waitlist with date-reached-lottery end event", async () => {
		const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		const result = await client.waitlist.create({
			endEvent: "date-reached-lottery",
			endsAt,
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.data?.endEvent).toBe("date-reached-lottery");
		expect(result.data?.endsAt).toBeDefined();
		expect(result.data?.beginsAt).toBeDefined();
		expect(result.data?.id).toBeDefined();
	});

	it("should create a waitlist with trigger end event", async () => {
		const result = await client.waitlist.create({
			endEvent: "trigger",
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.data?.endEvent).toBe("trigger");
		expect(result.data?.beginsAt).toBeDefined();
		expect(result.data?.id).toBeDefined();
	});

	it("should fail to create waitlist when user doesn't have permission", async () => {
		const { client: _client, signUpWithTestUser } = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					waitlist({
						canCreateWaitlist(ctx) {
							return false;
						},
						canGetWaitlist(ctx) {
							return false;
						},
						canAcceptUser(ctx) {
							return false;
						},
						canRejectUser(ctx) {
							return false;
						},
					}),
				],
			},
			clientOptions: {
				plugins: [waitlistClient()],
			},
		});

		const _user = await signUpWithTestUser();

		const result = await _client.waitlist.create({
			endEvent: "trigger" as const,
			beginsAt: new Date(),
			fetchOptions: {
				headers: _user.headers,
			},
		});

		expect(result.error?.statusText).toBe("FORBIDDEN");
	});

	it("should fail to create waitlist with invalid end event", async () => {
		const result = await client.waitlist.create({
			endEvent: "invalid-event" as any,
			beginsAt: new Date(),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.error).not.toBeNull();
	});

	it("should fail to create waitlist with max-signups-reached but no maxParticipants", async () => {
		const result = await client.waitlist.create({
			endEvent: "max-signups-reached" as const,
			// Missing maxParticipants
			beginsAt: new Date(),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.error).not.toBeNull();
	});

	it("should fail to create waitlist with date-reached but no endsAt", async () => {
		const result = await client.waitlist.create({
			endEvent: "date-reached" as const,
			// Missing endsAt
			beginsAt: new Date(),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.error).not.toBeNull();
	});

	it("should fail to create waitlist with date-reached-lottery but no endsAt", async () => {
		const result = await client.waitlist.create({
			endEvent: "date-reached-lottery" as const,
			// Missing endsAt
			beginsAt: new Date(),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result.error).not.toBeNull();
	});

	it("should fail to create waitlists at the same time when concurrent is false", async () => {
		const result1 = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: user.headers,
			},
		});

		const result2 = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result1.data?.endEvent).toBe("trigger");
		expect(result2.error?.statusText).toBe("BAD_REQUEST");
	});

	it("should fail to create waitlists at the same time when concurrent is false", async () => {
		const result1 = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: user.headers,
			},
		});

		const result2 = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(result1.data?.endEvent).toBe("trigger");
		expect(result2.error?.statusText).toBe("BAD_REQUEST");
	});

	it("should get any waitlist when user has permission", async () => {
		const createdWaitlist = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(createdWaitlist.data?.endEvent).toBe("trigger");

		const waitlist = await client.waitlist.getWaitlist({
			query: {
				id: createdWaitlist.data!.id,
			},
			fetchOptions: {
				headers: user.headers,
			},
		});

		expect(waitlist.data?.endEvent).toBe("trigger");
	});

	it("should fail to get any waitlist when user doesn't have permission", async () => {
		const { client: _client, signUpWithTestUser } = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					waitlist({
						canCreateWaitlist(ctx) {
							return false;
						},
						canGetWaitlist(ctx) {
							return false;
						},
						canAcceptUser(ctx) {
							return false;
						},
						canRejectUser(ctx) {
							return false;
						},
					}),
				],
			},
			clientOptions: {
				plugins: [waitlistClient()],
			},
		});

		const _user = await signUpWithTestUser();

		const createdWaitlist = await db.create<typeof auth.$Infer.Waitlist>({
			model: "waitlist",
			data: {
				endEvent: "trigger",
				beginsAt: new Date(),
				endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			},
		});

		expect(createdWaitlist?.endEvent).toBe("trigger");

		const result = await _client.waitlist.getWaitlist({
			query: {
				id: createdWaitlist.id,
			},
			fetchOptions: {
				headers: _user.headers,
			},
		});

		expect(result.error?.statusText).toBe("FORBIDDEN");
	});
});

describe("Waitlist with admin plugin", async () => {
	const ac = createAccessControl({
		...defaultStatements,
		waitlist: ["create", "read", "accept-user", "reject-user"],
	});
	const adminRole = ac.newRole({
		waitlist: ["create", "read", "accept-user", "reject-user"],
		...adminAc.statements,
	});
	const userRole = userAc;

	const { auth, context, resetDatabase, client, db } = await getTestInstance({
		options: {
			emailAndPassword: {
				enabled: true,
				autoSignIn: true,
			},
			plugins: [
				admin({
					ac,
					roles: {
						admin: adminRole,
						user: userRole,
					},
				}),
				waitlist({
					canCreateWaitlist: {
						statement: "waitlist",
						permissions: ["create"],
					},
					canGetWaitlist: {
						statement: "waitlist",
						permissions: ["read"],
					},
					canAcceptUser: {
						statement: "waitlist",
						permissions: ["accept-user"],
					},
					canRejectUser: {
						statement: "waitlist",
						permissions: ["reject-user"],
					},
				}),
			],
		},
		clientOptions: {
			plugins: [
				adminClient({
					ac,
					roles: {
						admin: adminRole,
						user: userRole,
					},
				}),
				waitlistClient(),
			],
		},
	});

	afterEach(async () => {
		await resetDatabase();
	});

	it("should fail create a waitlist when admin plugin isn't set up", async () => {
		const { auth: _auth, signUpWithTestUser } = await getTestInstance({
			options: {
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					waitlist({
						canCreateWaitlist: {
							statement: "waitlist",
							permissions: ["create"],
						},
						canGetWaitlist: {
							statement: "waitlist",
							permissions: ["read"],
						},
						canAcceptUser: {
							statement: "waitlist",
							permissions: ["accept-user"],
						},
						canRejectUser: {
							statement: "waitlist",
							permissions: ["reject-user"],
						},
					}),
				],
			},
			clientOptions: {
				plugins: [waitlistClient()],
			},
		});

		const user = await signUpWithTestUser();

		await expect(
			_auth.api.createWaitlist({
				headers: user.headers,
				body: {
					endEvent: "max-signups-reached",
					maxParticipants: 100,
				},
			}),
		).rejects.toMatchObject({
			status: "FAILED_DEPENDENCY",
		});
	});

	it("should create a waitlist when user has permission", async () => {
		const { user, token } = await auth.api.signUpEmail({
			body: {
				name: "admin user",
				email: "admin@example.com",
				password: "password123456",
			},
		});

		await context.internalAdapter.updateUser(user.id, {
			role: "admin",
		});

		const result = await auth.api.createWaitlist({
			headers: {
				authorization: `Bearer ${token}`,
			},
			body: {
				endEvent: "max-signups-reached",
				maxParticipants: 100,
			},
		});

		expect(result?.endEvent).toBe("max-signups-reached");
		expect(result?.maxParticipants).toBe(100);
		expect(result?.beginsAt).toBeDefined();
		expect(result?.id).toBeDefined();
	});

	it("should fail create a waitlist when user doesn't have permission", async () => {
		const { token } = await auth.api.signUpEmail({
			body: {
				name: "user",
				email: "user@example.com",
				password: "password123456",
			},
		});

		await expect(
			auth.api.createWaitlist({
				headers: {
					authorization: `Bearer ${token}`,
				},
				body: {
					endEvent: "max-signups-reached",
					maxParticipants: 100,
				},
			}),
		).rejects.toMatchObject({
			status: "FORBIDDEN",
		});
	});

	it("should get any waitlist when user has permission", async () => {
		const { user, token } = await auth.api.signUpEmail({
			body: {
				name: "admin user",
				email: "admin@example.com",
				password: "password123456",
			},
		});

		await context.internalAdapter.updateUser(user.id, {
			role: "admin",
		});

		expect(token).not.toBeNull();

		const createdWaitlist = await client.waitlist.create({
			endEvent: "trigger",
			endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			fetchOptions: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		});

		expect(createdWaitlist.data?.endEvent).toBe("trigger");

		const waitlist = await client.waitlist.getWaitlist({
			query: {
				id: createdWaitlist.data!.id,
			},
			fetchOptions: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		});

		expect(waitlist.data?.endEvent).toBe("trigger");
	});

	it("should fail to get any waitlist when user doesn't have permission", async () => {
		const { token } = await auth.api.signUpEmail({
			body: {
				name: "test user",
				email: "test@example.com",
				password: "password123456",
			},
		});

		expect(token).not.toBeNull();

		const createdWaitlist = await db.create<typeof auth.$Infer.Waitlist>({
			model: "waitlist",
			data: {
				endEvent: "trigger",
				beginsAt: new Date(),
				endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			},
		});

		expect(createdWaitlist?.endEvent).toBe("trigger");

		const waitlist = await client.waitlist.getWaitlist({
			query: {
				id: createdWaitlist.id,
			},
			fetchOptions: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		});

		expect(waitlist.error?.statusText).toBe("FORBIDDEN");
	});
});
