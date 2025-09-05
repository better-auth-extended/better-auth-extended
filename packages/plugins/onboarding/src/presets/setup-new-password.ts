import { z, ZodString } from "zod";
import { createOnboardingStep } from "..";

export type SetupNewPasswordStepOptions = {
	passwordSchema?:
		| ZodString
		| {
				/**
				 * @default 8
				 */
				minLength?: number;
				/**
				 * @default 128
				 */
				maxLength?: number;
		  };
	/**
	 * If true, this step must be completed before onboarding is considered done.
	 */
	required?: boolean;
};

export const setupNewPasswordStep = <O extends SetupNewPasswordStepOptions>(
	options?: O,
) => {
	return createOnboardingStep({
		input: z
			.object({
				newPassword:
					options?.passwordSchema instanceof ZodString
						? options.passwordSchema
						: z.string(),
				confirmPassword: z.string(),
			})
			.superRefine(({ newPassword, confirmPassword }, ctx) => {
				if (newPassword !== confirmPassword) {
					ctx.addIssue({
						path: ["confirmPassword"],
						code: "custom",
						message: "Passwords do not match.",
					});
				}
			}),
		async handler(ctx) {
			const session = ctx.context.session!;

			await ctx.context.internalAdapter.updatePassword(
				session.user.id,
				ctx.body.newPassword,
				ctx,
			);

			return {
				success: true,
			};
		},
		once: true,
		required: options?.required,
	});
};
