import { defineErrorCodes } from "better-auth";

export const ONBOARDING_ERROR_CODES = defineErrorCodes({
	ALREADY_ONBOARDED: "Already onboarded.",
	STEP_ALREADY_COMPLETED: "Step already completed.",
	COMPLETE_REQUIRED_STEPS_BEFORE_COMPLETING_ONBOARDING:
		"Complete required steps before completing onboarding.",
});
