import { getAdditionalPluginFields } from "@better-auth-extended/internal-utils";

export const getAdditionalFields = getAdditionalPluginFields("waitlistUser");



export const runAt = (date: Date, task: () => void) => {
	const target = date.getTime();
};
