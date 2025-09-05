import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { onboarding } from "../index";
import { onboardingClient } from "../client";
import { ONBOARDING_ERROR_CODES } from "../error-codes";
import { twoFactor } from "better-auth/plugins";
import database from "better-sqlite3";
import { setup2FAStep } from "./setup-2fa";

describe("setup-2fa preset", async () => {
	const { resetDatabase, client, signUpWithTestUser, db, testUser } =
		await getTestInstance({
			options: {
				database: database(":memory:"),
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					twoFactor(),
					onboarding({
						steps: {
							twoFactor: setup2FAStep({ required: false }),
							complete: {
								async handler(ctx) {
									return true;
								},
							},
						},
						completionStep: "complete",
					}),
				],
			},
			clientOptions: {
				plugins: [onboardingClient()],
			},
			shouldRunMigrations: true,
		});

	let headers: Headers;
	beforeAll(async () => {
		await resetDatabase();
		const result = await signUpWithTestUser();
		headers = result.headers;
	});

	beforeEach(async () => {
		await db.update({
			model: "user",
			where: [
				{
					field: "email",
					value: testUser.email,
				},
			],
			update: {
				shouldOnboard: true,
				completedSteps: "[]",
			},
		});
	});

	it("should validate required password field", async () => {
		const res = await (client.onboarding as any).step.twoFactor({
			password: "",
			fetchOptions: { headers },
		});
		expect(res.error?.status).toBe(400);
	});

	it("should accept optional issuer field", async () => {
		const res = await (client.onboarding as any).step.twoFactor({
			password: testUser.password,
			issuer: "TestApp",
			fetchOptions: { headers },
		});
		expect(res.data?.completedSteps).toContain("twoFactor");
	});

	it("should enforce once constraint for 2FA setup", async () => {
		await (client.onboarding as any).step.twoFactor({
			password: testUser.password,
			fetchOptions: { headers },
		});

		const res = await (client.onboarding as any).step.twoFactor({
			password: testUser.password,
			fetchOptions: { headers },
		});
		expect(res.error?.status).toBe(403);
		expect(res.error?.message).toBe(
			ONBOARDING_ERROR_CODES.STEP_ALREADY_COMPLETED,
		);
	});
});
