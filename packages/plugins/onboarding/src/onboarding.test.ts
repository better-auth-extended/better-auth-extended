import { describe, beforeAll, beforeEach, it, vi, expect } from "vitest";
import { createOnboardingStep, onboarding } from "./index";
import { onboardingClient } from "./client";
import { ONBOARDING_ERROR_CODES } from "./error-codes";
import { getTestInstance } from "@better-auth-extended/test-utils";
import database from "better-sqlite3";
import { z } from "zod";

const mockOnboardingRedirect = vi.fn();
describe("Onboarding", () => {
	describe("(success)", async () => {
		const { client, db, signUpWithTestUser, testUser, resetDatabase } =
			await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								newPassword: createOnboardingStep({
									input: z
										.object({
											foo: z.string().optional(),
										})
										.nullish(),
									handler(ctx) {
										return true;
									},
								}),
							},
							completionStep: "newPassword",
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: mockOnboardingRedirect,
						}),
					],
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

		it("should return true for shouldOnboard when user needs onboarding", async () => {
			const { data, error } = await client.onboarding.shouldOnboard({
				fetchOptions: {
					headers,
				},
			});
			if (error) throw error;
			expect(data).toBe(true);
		});

		it("should trigger redirect via getSession hook", async () => {
			mockOnboardingRedirect.mockClear();
			await client.getSession({
				fetchOptions: {
					headers,
					throw: true,
				},
			});
			expect(mockOnboardingRedirect).toHaveBeenCalled();
		});

		it("should complete onboarding step successfully and return true", async () => {
			const res = await (client.onboarding as any).step.newPassword({
				foo: "bar",
				fetchOptions: {
					headers,
				},
			});
			if (res.error) throw res.error;
			expect(res.data.completedSteps).toEqual(["newPassword"]);
			expect(res.data.data).toBe(true);
		});

		it("should not trigger redirect via getSession after completing onboarding", async () => {
			mockOnboardingRedirect.mockClear();
			await (client as any).onboarding.step.newPassword({
				fetchOptions: {
					headers,
				},
			});
			await client.getSession({
				fetchOptions: {
					headers,
					throw: true,
				},
			});
			expect(mockOnboardingRedirect).not.toHaveBeenCalled();
		});

		it("should return forbidden on shouldOnboard when already onboarded", async () => {
			await (client.onboarding as any).step.newPassword({
				fetchOptions: {
					headers,
				},
			});
			const { error } = await client.onboarding.shouldOnboard({
				fetchOptions: {
					headers,
				},
			});
			expect(error?.status).toBe(403);
			expect(error?.message).toBe(ONBOARDING_ERROR_CODES.ALREADY_ONBOARDED);
		});

		it("should fail shouldOnboard without session", async () => {
			const { error } = await client.onboarding.shouldOnboard();
			expect(error?.status).toBe(401);
		});

		it("should fail onboarding without session", async () => {
			const res = await (client.onboarding as any).step.newPassword({
				fetchOptions: {
					headers: new Headers(),
				},
			});
			expect(res.error?.status).toBe(401);
		});

		it("should error when completing the same step twice if once is true", async () => {
			await (client.onboarding as any).step.newPassword({
				fetchOptions: {
					headers,
				},
			});
			const res = await (client.onboarding as any).step.newPassword({
				fetchOptions: {
					headers,
				},
			});
			expect(res.error?.status).toBe(403);
		});
	});

	describe("(auto enable on sign-up)", async () => {
		const { signUpWithTestUser, resetDatabase } = await getTestInstance({
			options: {
				database: database(":memory:"),
				emailAndPassword: {
					enabled: true,
					autoSignIn: true,
				},
				plugins: [
					onboarding({
						steps: {
							newPassword: createOnboardingStep({
								input: z
									.object({
										foo: z.string().optional(),
									})
									.nullish(),
								handler(ctx) {
									return true;
								},
							}),
						},
						completionStep: "newPassword",
					}),
				],
			},
			clientOptions: {
				plugins: [
					onboardingClient({
						onOnboardingRedirect: mockOnboardingRedirect,
					}),
				],
			},
			shouldRunMigrations: true,
		});

		beforeEach(async () => {
			await resetDatabase();
		});

		it("should trigger redirect during sign-up when autoEnableOnSignUp is true", async () => {
			mockOnboardingRedirect.mockClear();
			await signUpWithTestUser();
			expect(mockOnboardingRedirect).toHaveBeenCalled();
		});

		it("should not trigger redirect during sign-up when autoEnableOnSignUp is false", async () => {
			mockOnboardingRedirect.mockClear();
			const { signUpWithTestUser } = await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								newPassword: createOnboardingStep({
									input: z
										.object({
											foo: z.string().optional(),
										})
										.nullish(),
									handler(ctx) {
										return true;
									},
								}),
							},
							completionStep: "newPassword",
							autoEnableOnSignUp: false,
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: mockOnboardingRedirect,
						}),
					],
				},
				shouldRunMigrations: true,
			});
			await signUpWithTestUser();
			expect(mockOnboardingRedirect).not.toHaveBeenCalled();
		});

		it("should trigger redirect when autoEnableOnSignUp is a function returning true", async () => {
			mockOnboardingRedirect.mockClear();
			const { signUpWithTestUser } = await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								newPassword: createOnboardingStep({
									input: z
										.object({
											foo: z.string().optional(),
										})
										.nullish(),
									handler(ctx) {
										return true;
									},
								}),
							},
							autoEnableOnSignUp: () => true,
							completionStep: "newPassword",
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: mockOnboardingRedirect,
						}),
					],
				},
				shouldRunMigrations: true,
			});
			await signUpWithTestUser();
			expect(mockOnboardingRedirect).toHaveBeenCalled();
		});

		it("should not trigger redirect when autoEnableOnSignUp is an async function returning false", async () => {
			mockOnboardingRedirect.mockClear();
			const { signUpWithTestUser } = await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								newPassword: createOnboardingStep({
									input: z
										.object({
											foo: z.string().optional(),
										})
										.nullish(),
									handler(ctx) {
										return true;
									},
								}),
							},
							autoEnableOnSignUp: async () => false,
							completionStep: "newPassword",
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: mockOnboardingRedirect,
						}),
					],
				},
				shouldRunMigrations: true,
			});
			await signUpWithTestUser();
			expect(mockOnboardingRedirect).not.toHaveBeenCalled();
		});
	});

	describe("(required steps)", async () => {
		const { resetDatabase, client, signUpWithTestUser, db, testUser } =
			await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								profile: {
									handler: async () => true,
									required: true,
								},
								newPassword: {
									handler: async () => true,
								},
							},
							completionStep: "newPassword",
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: () => Promise.resolve(),
						}),
					],
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

		it("should forbid completing completion step before required steps", async () => {
			const res = await (client.onboarding as any).step.newPassword({
				fetchOptions: { headers },
			});
			expect(res.error?.status).toBe(403);
			expect(res.error?.message).toBe(
				ONBOARDING_ERROR_CODES.COMPLETE_REQUIRED_STEPS_BEFORE_COMPLETING_ONBOARDING,
			);
		});

		it("should allow completion after required steps are completed", async () => {
			const r1 = await (client.onboarding as any).step.profile({
				fetchOptions: { headers },
			});
			if (r1.error) throw r1.error;
			const r2 = await (client.onboarding as any).step.newPassword({
				fetchOptions: { headers },
			});
			if (r2.error) throw r2.error;
			expect(r2.data.completedSteps).toEqual(["profile", "newPassword"]);
		});
	});

	describe("(skip completion step)", async () => {
		const { resetDatabase, client, signUpWithTestUser, db, testUser } =
			await getTestInstance({
				options: {
					database: database(":memory:"),
					emailAndPassword: {
						enabled: true,
						autoSignIn: true,
					},
					plugins: [
						onboarding({
							steps: {
								profile: {
									handler: async () => true,
									required: true,
								},
								preferences: {
									handler: async () => true,
								},
							},
							completionStep: "preferences",
						}),
					],
				},
				clientOptions: {
					plugins: [
						onboardingClient({
							onOnboardingRedirect: () => Promise.resolve(),
						}),
					],
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

		it("should allow skipping non-required completion step", async () => {
			await client.onboarding.step.profile({
				fetchOptions: { headers },
			});

			const res = await client.onboarding.skipStep.preferences({
				fetchOptions: { headers },
			});

			if (res.error) throw res.error;
			expect(res.data.completedSteps).toEqual(["profile"]);
			expect(res.data.data).toBe(null);
		});

		it("should forbid skipping completion step before required steps are completed", async () => {
			const res = await client.onboarding.skipStep.preferences({
				fetchOptions: { headers },
			});

			expect(res.error?.status).toBe(403);
			expect(res.error?.message).toBe(
				ONBOARDING_ERROR_CODES.COMPLETE_REQUIRED_STEPS_BEFORE_COMPLETING_ONBOARDING,
			);
		});

		it("should forbid skipping already completed step", async () => {
			await client.onboarding.step.profile({
				fetchOptions: { headers },
			});

			await client.onboarding.step.preferences({
				fetchOptions: { headers },
			});

			const res = await client.onboarding.skipStep.preferences({
				fetchOptions: { headers },
			});

			expect(res.error?.status).toBe(403);
		});

		it("should mark onboarding as complete when skipping non-required completion step", async () => {
			await client.onboarding.step.profile({
				fetchOptions: { headers },
			});

			await client.onboarding.skipStep.preferences({
				fetchOptions: { headers },
			});

			const { data: needsOnboarding } = await client.onboarding.shouldOnboard({
				fetchOptions: { headers },
			});

			expect(needsOnboarding).not.toBe(true);
		});
	});
});
