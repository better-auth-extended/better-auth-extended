import type { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type { OnboardingStep } from "./types";
import type { ZodType } from "zod";
import type { TransformClientPath, TransformPath } from "./utils";

type InferStepInput<K extends OnboardingStep<any, any, any>> = K extends {
	input?: infer I;
}
	? I extends ZodType<infer Schema>
		? Schema
		: undefined
	: undefined;

type InferStepResult<K extends OnboardingStep<any, any, any>> =
	K extends OnboardingStep<any, infer R, any> ? R : never;

export type OnboardingStepReturnType<K extends OnboardingStep<any, any, any>> =
	{
		completedSteps: string[];
		data: InferStepResult<K>;
	};

export type CanAccessOnboardingStepReturnType = boolean;

export type EndpointPair<
	Path extends string,
	K extends OnboardingStep<any, any, any>,
	C extends string,
> = {
	onboardingStep: ReturnType<
		typeof createAuthEndpoint<
			`/onboarding/step/${TransformClientPath<Path>}`,
			{
				method: "POST";
				body: ZodType<InferStepInput<K>>;
				use: [typeof sessionMiddleware];
			},
			OnboardingStepReturnType<K>
		>
	>;
	canAccessOnboardingStep: ReturnType<
		typeof createAuthEndpoint<
			`/onboarding/can-access-step/${TransformClientPath<Path>}`,
			{
				method: "GET";
				use: [typeof sessionMiddleware];
				metadata: {
					SERVER_ONLY: true;
				};
			},
			CanAccessOnboardingStepReturnType
		>
	>;
};

type PrefixedEndpoints<
	Path extends string,
	S extends OnboardingStep<any, any, any>,
	C extends string,
> = {
	[K in keyof EndpointPair<
		Path,
		S,
		C
	> as `${Extract<K, string>}${TransformPath<Path>}`]: EndpointPair<
		Path,
		S,
		C
	>[K];
};

export type OnboardingStepsToEndpoints<
	S extends Record<string, OnboardingStep<any, any, any>>,
	CompletionStep extends keyof S,
> = {
	[K in keyof S & string]: PrefixedEndpoints<
		K,
		S[K],
		Extract<CompletionStep, string>
	>;
};

export type SkipOnboardingStepReturnType = {
	completedSteps: string[];
	data: null;
};

type SkipOnboardingStepEndpoint<Path extends string> = ReturnType<
	typeof createAuthEndpoint<
		`/onboarding/skip-step/${TransformClientPath<Path>}`,
		{
			method: "POST";
			use: [typeof sessionMiddleware];
		},
		SkipOnboardingStepReturnType
	>
>;
export type InferSkipCompletionStep<
	S extends Record<string, OnboardingStep<any, any, any>>,
	CompletionStep extends keyof S,
> = {
	[K in `skipOnboardingStep${TransformPath<Extract<CompletionStep, string>>}`]: S[CompletionStep]["required"] extends infer R extends
		boolean
		? R extends true
			? never
			: SkipOnboardingStepEndpoint<Extract<CompletionStep, string>>
		: SkipOnboardingStepEndpoint<Extract<CompletionStep, string>>;
};

export type Merged<T> = {
	[K in keyof T]: T[K];
}[keyof T];

export type IsEqual<A, B> = (<G>() => G extends (A & G) | G ? 1 : 2) extends <
	G,
>() => G extends (B & G) | G ? 1 : 2
	? true
	: false;
