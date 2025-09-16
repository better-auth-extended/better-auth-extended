import { describe } from "vitest";
import { preferences } from "../src/index";
import { preferencesClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { z } from "zod";
import { betterAuth } from "better-auth";

describe("Preferences", async () => {
	const auth = betterAuth({
		secret: "better-auth.secret",
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
	});

	const user = await signUpWithTestUser();
});
