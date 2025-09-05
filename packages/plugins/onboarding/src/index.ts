import type { BetterAuthPlugin, PrettifyDeep } from "better-auth";
import { mergeSchema } from "better-auth/db";
import { schema } from "./schema";
import { ONBOARDING_ERROR_CODES } from "./error-codes";
import {
	createAuthEndpoint,
	createAuthMiddleware,
	APIError,
	sessionMiddleware,
	type AuthEndpoint,
} from "better-auth/api";
import type { OnboardingOptions, OnboardingStep } from "./types";
import type {
	CanAccessOnboardingStepReturnType,
	InferSkipCompletionStep,
	Merged,
	OnboardingStepReturnType,
	OnboardingStepsToEndpoints,
	SkipOnboardingStepReturnType,
} from "./internal-types";
import { transformClientPath, transformPath } from "./utils";
import { verifyOnboarding } from "./verify-onboarding";
import { getOnboardingAdapter } from "./adapter";

export const onboarding = <
	Steps extends Record<string, OnboardingStep<any, any, any>>,
	CompletionStep extends keyof Steps,
>(
	options: OnboardingOptions<Steps, CompletionStep>,
) => {
	const opts = {
		autoEnableOnSignUp: true,
		...options,
	};

	const steps = Object.entries(options.steps);

	const requiredSteps = steps.filter(([_, step]) => step.required);
	const endpoints = Object.fromEntries(
		steps.flatMap(([id, step]) => {
			const isCompletionStep = options.completionStep === id;
			const key = transformPath(id);
			const path = transformClientPath(id);

			const endpoints: Record<string, AuthEndpoint> = {
				[`onboardingStep${key}`]: createAuthEndpoint(
					`/onboarding/step/${path}`,
					{
						method: "POST",
						body: step.input,
						use: [sessionMiddleware],
						requireHeaders: step.requireHeaders,
						requireRequest: step.requireRequest,
						cloneRequest: step.cloneRequest,
					},
					async (ctx): Promise<OnboardingStepReturnType<typeof step>> => {
						const adapter = getOnboardingAdapter(options, ctx);
						const { session } = await verifyOnboarding(ctx, {
							adapter,
							options,
						});

						const completedSteps = await adapter.getCompletedSteps(
							session.user.id,
						);

						if (step.once && completedSteps.has(id)) {
							throw new APIError("FORBIDDEN", {
								message: ONBOARDING_ERROR_CODES.STEP_ALREADY_COMPLETED,
							});
						}

						if (
							isCompletionStep &&
							requiredSteps
								.filter(([key]) => key !== id)
								.some(([key]) => !completedSteps.has(key))
						) {
							throw new APIError("FORBIDDEN", {
								message:
									ONBOARDING_ERROR_CODES.COMPLETE_REQUIRED_STEPS_BEFORE_COMPLETING_ONBOARDING,
							});
						}

						const result = await step.handler(ctx);

						const updatedSteps = [...completedSteps.add(id)];
						const update: Record<string, any> = {
							completedSteps: updatedSteps,
						};

						if (isCompletionStep) {
							update.shouldOnboard = false;
						}

						await adapter.updateOnboardingState(session.user.id, update);

						return {
							completedSteps: updatedSteps,
							data: result,
						};
					},
				),
				[`canAccessOnboardingStep${key}`]: createAuthEndpoint(
					`/onboarding/can-access-step/${path}`,
					{
						method: "GET",
						use: [sessionMiddleware],
						metadata: {
							SERVER_ONLY: true,
						},
					},
					async (ctx): Promise<CanAccessOnboardingStepReturnType> => {
						const adapter = getOnboardingAdapter(options, ctx);
						const { session } = await verifyOnboarding(ctx, {
							adapter,
							options,
						});

						if (step.once) {
							const completedSteps = await adapter.getCompletedSteps(
								session.user.id,
							);

							if (completedSteps?.has(id)) {
								throw new APIError("FORBIDDEN", {
									message: ONBOARDING_ERROR_CODES.STEP_ALREADY_COMPLETED,
								});
							}
						}

						return true;
					},
				),
			};

			if (isCompletionStep && step.required !== true) {
				endpoints[`skipOnboardingStep${key}`] = createAuthEndpoint(
					`/onboarding/skip-step/${path}`,
					{
						method: "POST",
						use: [sessionMiddleware],
					},
					async (ctx): Promise<SkipOnboardingStepReturnType> => {
						const adapter = getOnboardingAdapter(options, ctx);
						const { session } = await verifyOnboarding(ctx, {
							adapter,
							options,
						});

						const completedSteps = await adapter.getCompletedSteps(
							session.user.id,
						);

						if (completedSteps.has(id)) {
							throw new APIError("FORBIDDEN", {
								message: ONBOARDING_ERROR_CODES.STEP_ALREADY_COMPLETED,
							});
						}
						if (
							requiredSteps
								.filter(([key]) => key !== id)
								.some(([key]) => !completedSteps.has(key))
						) {
							throw new APIError("FORBIDDEN", {
								message:
									ONBOARDING_ERROR_CODES.COMPLETE_REQUIRED_STEPS_BEFORE_COMPLETING_ONBOARDING,
							});
						}

						await adapter.updateOnboardingState(session.user.id, {
							shouldOnboard: false,
						});

						return {
							completedSteps: [...completedSteps],
							data: null,
						};
					},
				);
			}

			return Object.entries(endpoints);
		}),
	) as PrettifyDeep<
		Merged<OnboardingStepsToEndpoints<Steps, CompletionStep>> &
			InferSkipCompletionStep<Steps, CompletionStep>
	>;

	return {
		id: "onboarding",
		endpoints: {
			shouldOnboard: createAuthEndpoint(
				"/onboarding/should-onboard",
				{
					method: "GET",
					use: [sessionMiddleware],
				},
				async (ctx) => {
					await verifyOnboarding(ctx, {
						options,
					});

					return true;
				},
			),
			...endpoints,
		},
		hooks: {
			after: [
				{
					matcher(context) {
						return context.path === "/get-session";
					},
					handler: createAuthMiddleware(async (ctx) => {
						const data = ctx.context.session;

						if (!data?.user.shouldOnboard) {
							return null;
						}

						return ctx.json({
							onboardingRedirect: true,
						});
					}),
				},
				{
					matcher(context) {
						return (
							opts.autoEnableOnSignUp && context.path.startsWith("/sign-up")
						);
					},
					handler: createAuthMiddleware(async (ctx) => {
						const adapter = getOnboardingAdapter(options, ctx);
						const data = ctx.context.newSession;
						const enabled =
							typeof opts.autoEnableOnSignUp === "function"
								? await opts.autoEnableOnSignUp(ctx)
								: opts.autoEnableOnSignUp;

						if (!data || !enabled) {
							return;
						}

						await adapter.updateOnboardingState(data.user.id, {
							shouldOnboard: true,
						});

						return ctx.json({
							onboardingRedirect: true,
						});
					}),
				},
			],
		},
		rateLimit: [
			{
				pathMatcher(path) {
					return path.startsWith("/onboarding/");
				},
				window: 10,
				max: 3,
			},
		],
		schema: !options.secondaryStorage
			? mergeSchema(schema, opts?.schema)
			: undefined,
		$ERROR_CODES: ONBOARDING_ERROR_CODES,
		$Infer: {
			OnboardingSteps: {} as Steps,
			OnboardingCompletionStep: {} as CompletionStep,
		},
	} satisfies BetterAuthPlugin;
};

export const createOnboardingStep = <
	Schema extends Record<string, any> | undefined | null,
	Result = unknown,
	Required extends boolean = false,
>(
	def: Omit<OnboardingStep<Schema, Result, Required>, "required"> &
		(Required extends true ? { required: true } : { required?: Required }),
) => {
	return {
		once: true,
		required: (def.required ?? false) as Required,
		...def,
	};
};

export * from "./types";
export * from "./client";
