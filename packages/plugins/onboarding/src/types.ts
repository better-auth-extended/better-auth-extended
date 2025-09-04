import type { GenericEndpointContext, InferOptionSchema } from "better-auth";
import type { ZodType } from "zod";
import type { schema } from "./schema";

type ActionEndpointContext<Schema = unknown, Result = unknown> = (
	ctx: Omit<GenericEndpointContext, "body"> & {
		body: Schema;
	},
) => Result | Promise<Result>;

export type OnboardingOptions<
	Steps extends Record<string, OnboardingStep<any, any, any>>,
	CompletionStep extends keyof Steps,
> = {
	/**
	 * Map of onboarding steps keyed by a unique step identifier.
	 */
	steps: Steps;
	/**
	 * The key of the step that, when completed, marks onboarding as finished.
	 */
	completionStep: CompletionStep;
	/**
	 * Whether to automatically enable onboarding for new users during sign up
	 * @default true
	 */
	autoEnableOnSignUp?:
		| boolean
		| ((ctx: GenericEndpointContext) => boolean | Promise<boolean>);
	/**
	 * Whether to use secondary storage instead of database.
	 *
	 * @default false
	 */
	secondaryStorage?: boolean;
	/**
	 * Custom schema configuration for the onboarding plugin
	 */
	schema?: InferOptionSchema<typeof schema>;
};

export type OnboardingStep<
	Schema extends Record<string, any> | undefined | null,
	Result,
	Required extends boolean = false,
> = {
	/**
	 * Optional Zod schema used to validate the request body for this step.
	 * If omitted, the handler receives the raw body without validation.
	 */
	input?: ZodType<Schema>;
	/**
	 * The function executed for this step. Receives the validated body (if an
	 * `input` schema is provided) and the endpoint context. Can be async and
	 * should return the step result.
	 */
	handler: ActionEndpointContext<Schema, Result>;
	/**
	 * If true, this step can be completed only once per user. Subsequent
	 * attempts should be treated as no-ops or rejected.
	 */
	once?: boolean;
	/**
	 * If true headers will be required to be passed in the context
	 */
	requireHeaders?: boolean;
	/**
	 * If true request object will be required
	 */
	requireRequest?: boolean;
	/**
	 * Clone the request object from the router
	 */
	cloneRequest?: boolean;

	/**
	 * If true, this step must be completed before onboarding is considered done.
	 */
	required?: boolean;
} & (Required extends true ? { required: true } : { required?: false });
