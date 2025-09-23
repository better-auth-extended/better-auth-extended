import { describe, it, expect } from "vitest";
import { preferences } from "../src/index";
import { preferencesClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { z } from "zod";
import { betterAuth } from "better-auth";

import database from "better-sqlite3";

describe("Preferences", async () => {
	const auth = betterAuth({
		secret: "better-auth.secret",
		database: database(":memory:"),
		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
		},
		rateLimit: {
			enabled: false,
		},
		logger: {
			level: "debug",
		},
		plugins: [
			preferences({
				scopes: {
					user: preferences.createScope({
						preferences: {
							theme: {
								type: z.enum(["light", "dark", "system"]),
							},
							notifications: {
								type: z.object({
									email: z.boolean(),
									push: z.boolean(),
									sms: z.boolean(),
								}),
							},
							sensitiveData: {
								type: z.string(),
								sensitive: true,
							},
						},
						defaultValues: {
							theme: "system",
							notifications: () => ({
								email: true,
								push: false,
								sms: false,
							}),
						},
						requireScopeId: false,
						mergeStrategy: "deep",
					}),
					workspace: preferences.createScope({
						preferences: {
							language: {
								type: z.string(),
							},
						},
						requireScopeId: true,
						disableUserBinding: true,
					}),
					project: preferences.createScope({
						preferences: {
							language: {
								type: z.string(),
							},
						},
						requireScopeId: false,
					}),
					restricted: preferences.createScope({
						preferences: {
							adminSetting: {
								type: z.boolean(),
							},
						},
						canWrite: false,
						canRead: true,
					}),
				},
			}),
		],
	});
	const { client, db, signUpWithTestUser } = await getTestInstance({
		auth,
		clientOptions: {
			plugins: [preferencesClient<typeof auth>()],
		},
		shouldRunMigrations: true,
	});

	const user = await signUpWithTestUser();

	describe("setPreference", () => {
		it("should validate value against schema", async () => {
			const { error } = await client.preferences.user.theme.set({
				value: "invalid" as any,
				fetchOptions: {
					headers: user.headers,
				},
			});

			expect(error?.statusText).toBe("BAD_REQUEST");
		});

		it("should save preference", async () => {
			await client.preferences.user.theme.set({
				value: "dark",
				fetchOptions: {
					headers: user.headers,
				},
			});

			const saved = await db.findOne<{ value: string }>({
				model: "preference",
				where: [
					{
						field: "scope",
						value: "user",
					},
					{
						field: "key",
						value: "theme",
					},
					{
						field: "userId",
						value: user.user.id,
					},
				],
				select: ["value"],
			});

			expect(saved).not.toBeNull();
			expect(JSON.parse(saved!.value)).toBe("dark");
		});

		it("should delete entry when value equals defaultValue", async () => {
			await client.preferences.user.theme.set({
				value: "system",
				fetchOptions: {
					headers: user.headers,
				},
			});

			const saved = await db.findOne<{ value: string }>({
				model: "preference",
				where: [
					{
						field: "scope",
						value: "user",
					},
					{
						field: "key",
						value: "theme",
					},
					{
						field: "userId",
						value: user.user.id,
					},
				],
				select: ["value"],
			});

			expect(saved).toBeNull();
		});

		it("should encrypt value when attribute is sensitive", async () => {
			await client.preferences.user.sensitiveData.set({
				value: "sensitive-data",
				fetchOptions: {
					headers: user.headers,
				},
			});

			const saved = await db.findOne<{ value: string }>({
				model: "preference",
				where: [
					{
						field: "scope",
						value: "user",
					},
					{
						field: "key",
						value: "sensitiveData",
					},
					{
						field: "userId",
						value: user.user.id,
					},
				],
				select: ["value"],
			});

			expect(saved).not.toBeNull();
			const keys = Object.keys(JSON.parse(saved!.value));
			expect(keys).toContain("encryptedValue");
			expect(keys).toContain("iv");
		});

		it("should not bind user when disableUserBinding is true", async () => {
			await client.preferences.workspace.language.set({
				scopeId: "ws-1",
				value: "DE",
				fetchOptions: {
					headers: user.headers,
				},
			});
			const saved = await db.findOne<{
				scopeId: string;
				userId: string | null;
			}>({
				model: "preference",
				where: [
					{
						field: "scope",
						value: "workspace",
					},
					{
						field: "key",
						value: "language",
					},
					{
						field: "scopeId",
						value: "ws-1",
					},
				],
				select: ["scopeId", "userId"],
			});

			expect(saved?.scopeId).toBe("ws-1");
			expect(saved?.userId).toBeNull();
		});

		it("should reject unauthenticated write when user binding enabled", async () => {
			const { error } = await client.preferences.user.theme.set({
				value: "dark",
			});
			expect(error?.statusText).toBe("UNAUTHORIZED");
		});

		it("should forbid when canWrite is false", async () => {
			const { error } = await client.preferences.restricted.adminSetting.set({
				value: true,
				fetchOptions: { headers: user.headers },
			});
			expect(error?.statusText).toBe("FORBIDDEN");
		});

		it("should return BAD_REQUEST for unknown scope", async () => {
			const res = await client.preferences.setPreference({
				scope: "unknown",
				key: "x",
				value: "y",
				fetchOptions: {
					headers: user.headers,
				},
			});
			expect(res.error?.statusText).toBe("BAD_REQUEST");
		});

		it("should return BAD_REQUEST for unknown key", async () => {
			const res = await client.preferences.setPreference({
				scope: "user",
				key: "unknown",
				value: "y",
				fetchOptions: {
					headers: user.headers,
				},
			});

			expect(res.error?.statusText).toBe("BAD_REQUEST");
		});
	});

	describe("getPreference", () => {
		it("should reject unauthenticated read when user binding enabled", async () => {
			const { error } = await client.preferences.user.theme.get();
			expect(error?.statusText).toBe("UNAUTHORIZED");
		});

		it("should allow unauthenticated access when user binding disabled", async () => {
			const { error } = await client.preferences.workspace.language.set({
				scopeId: "ws-open",
				value: "EN",
			});
			expect(error).toBeNull();
			const { data } = await client.preferences.workspace.language.get({
				query: {
					scopeId: "ws-open",
				},
			});
			expect(data).toBe("EN");
		});

		it("get without saved value and no default returns null", async () => {
			const { data, error } = await client.preferences.project.language.get({
				fetchOptions: { headers: user.headers },
			});
			expect(error).toBeNull();
			expect(data).toBeNull();
		});

		it("should return default value when no value is saved", async () => {
			const { data, error } = await client.preferences.user.notifications.get({
				fetchOptions: { headers: user.headers },
			});
			expect(error).toBeNull();
			expect(data).toEqual({ email: true, push: false, sms: false });
		});

		it("should error when scopeId missing and required", async () => {
			const { error } = await client.preferences.workspace.language.get({
				query: {} as any,
			});
			expect(error?.statusText).toBe("BAD_REQUEST");
		});

		it("read is allowed when canRead is true", async () => {
			const { data, error } =
				await client.preferences.restricted.adminSetting.get({
					fetchOptions: { headers: user.headers },
				});
			expect(error).toBeNull();
			expect(data).toBeNull();
		});

		it("should decrypt sensitive value", async () => {
			await client.preferences.user.sensitiveData.set({
				value: "super-secret",
				fetchOptions: { headers: user.headers },
			});
			const { data, error } = await client.preferences.user.sensitiveData.get({
				fetchOptions: { headers: user.headers },
			});
			expect(error).toBeNull();
			expect(data).toBe("super-secret");
		});

		it("should return BAD_REQUEST for unknown scope", async () => {
			const res = await client.preferences.getPreference({
				query: { scope: "unknown" as any, key: "x" },
				fetchOptions: { headers: user.headers },
			});
			expect(res.error?.statusText).toBe("BAD_REQUEST");
		});

		it("should return BAD_REQUEST for unknown key", async () => {
			const res = await client.preferences.getPreference({
				query: { scope: "user", key: "unknown" as any },
				fetchOptions: { headers: user.headers },
			});
			expect(res.error?.statusText).toBe("BAD_REQUEST");
		});
	});
});
