import { getAdditionalPluginFields } from "@better-auth-extended/internal-utils";
import type { admin } from "better-auth/plugins";

export const getAdditionalFields = getAdditionalPluginFields("waitlist");
export const getAdditionalUserFields = getAdditionalPluginFields("waitlistUser");

export type AdminPlugin = ReturnType<typeof admin<any>>;