import { describe } from "vitest";
import { preferences } from "../src/index";
import { preferencesClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";

describe("Preferences", async () => {
	const { auth, client, db, signUpWithTestUser } = await getTestInstance({
		options: {
			emailAndPassword: {
				enabled: true,
				autoSignIn: true,
			},
			plugins: [preferences()],
		},
		clientOptions: {
			plugins: [preferencesClient()],
		},
	});
});
