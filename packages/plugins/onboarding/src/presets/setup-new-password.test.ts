import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { onboarding } from "../index";
import { onboardingClient } from "../client";
import { twoFactor } from "better-auth/plugins";
import database from "better-sqlite3";
import { setupNewPasswordStep } from "./setup-new-password";

describe("setup-new-password preset", async () => {
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
							newPassword: setupNewPasswordStep({ required: true }),
						},
						completionStep: "newPassword",
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

	it("should validate password and confirmPassword match", async () => {
		const res = await (client.onboarding as any).step.newPassword({
			newPassword: "newpassword123",
			confirmPassword: "differentpassword",
			fetchOptions: { headers },
		});
		expect(res.error?.status).toBe(400);
		expect(res.error?.message).toContain("Invalid body parameters");
	});

	it("should successfully update password when passwords match", async () => {
		const res = await (client.onboarding as any).step.newPassword({
			newPassword: "newpassword123",
			confirmPassword: "newpassword123",
			fetchOptions: { headers },
		});
		if (res.error) throw res.error;
		expect(res.data.data.success).toBe(true);
		expect(res.data.completedSteps).toEqual(["newPassword"]);
	});

	it("should mark step as completed and finish onboarding", async () => {
		const res = await (client.onboarding as any).step.newPassword({
			newPassword: "newpassword123",
			confirmPassword: "newpassword123",
			fetchOptions: { headers },
		});
		if (res.error) throw res.error;

		const { data: shouldOnboard } = await client.onboarding.shouldOnboard({
			fetchOptions: { headers },
		});
		expect(shouldOnboard).not.toBe(true);
	});

	it("should enforce once constraint for password setup", async () => {
		await (client.onboarding as any).step.newPassword({
			newPassword: "newpassword123",
			confirmPassword: "newpassword123",
			fetchOptions: { headers },
		});

		const res = await (client.onboarding as any).step.newPassword({
			newPassword: "anotherpassword123",
			confirmPassword: "anotherpassword123",
			fetchOptions: { headers },
		});
		expect(res.error?.status).toBe(403);
		expect(res.error?.message).toBeDefined();
	});
});
