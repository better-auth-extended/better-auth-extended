import { APIError } from "better-auth";
import { createOnboardingStep } from "..";
import { z } from "zod";

export type Setup2FAOptions = {
	/**
	 * If true, this step must be completed before onboarding is considered done.
	 */
	required?: boolean;
};

export const setup2FAStep = <O extends Setup2FAOptions>(options?: O) => {
	return createOnboardingStep({
		input: z.object({
			password: z.string().nonempty(),
			issuer: z.string().optional(),
		}),
		async handler(ctx) {
			const plugin = ctx.context.options.plugins?.find(
				(p) => p.id === "two-factor",
			);

			if (!plugin?.endpoints) {
				throw new APIError("FAILED_DEPENDENCY", {
					message: "2FA is not set up.",
				});
			}

			const res = (await plugin.endpoints.enableTwoFactor(ctx)) as {
				totpURI: string;
				backupCodes: string[];
			};

			return res;
		},
		once: true,
		required: options?.required,
	});
};
