import { describe } from "vitest";
import { helpDesk } from "../src/index";
import { helpDeskClient } from "../src/client";
import { getTestInstance } from "@better-auth-extended/test-utils";

describe("Help Desk", async () => {
	const { auth, client, db, signUpWithTestUser } = await getTestInstance({
		options: {
			emailAndPassword: {
				enabled: true,
				autoSignIn: true,
			},
			plugins: [
				helpDesk({
					canCreateTicket: true,
				}),
			],
		},
		clientOptions: {
			plugins: [helpDeskClient()],
		},
	});
});
