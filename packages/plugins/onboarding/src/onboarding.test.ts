import { describe, it } from "vitest";
import { onboarding } from "../src/index";
import { onboardingClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";

describe("Onboarding", async () => {
    const { auth, client, db, signUpWithTestUser, } = await getTestInstance({
        options: {
            emailAndPassword: {
                enabled: true,
                autoSignIn: true,
            },
            plugins: [onboarding()],
        },
        clientOptions: {
            plugins: [onboardingClient()],
        },
    });
});
