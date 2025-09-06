import { describe } from "vitest";
import { waitlist } from "../src/index";
import { waitlistClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";

describe("Waitlist", async () => {
	const { auth, client, db, signUpWithTestUser } = await getTestInstance({
		options: {
			emailAndPassword: {
				enabled: true,
				autoSignIn: true,
			},
			plugins: [
				waitlist({
					enabled: false,
				}),
			],
		},
		clientOptions: {
			plugins: [waitlistClient()],
		},
	});
});
