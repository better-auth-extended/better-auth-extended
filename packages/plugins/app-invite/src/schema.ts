import { generateId } from "better-auth";
import { z } from "zod";

export const appInvitationStatus = z
	.enum(["pending", "accepted", "rejected", "canceled"])
	.default("pending");
export const appInvitationSchema = z.object({
	id: z.string().default(generateId),
	name: z.string().optional(),
	email: z.email().optional(),
	status: appInvitationStatus,
	inviterId: z.string(),
	expiresAt: z.date().optional(),
	domainWhitelist: z.string().optional(),
});
export type AppInvitation = z.infer<typeof appInvitationSchema>;
export type AppInvitationInput = z.input<typeof appInvitationSchema>;
export type AppInvitationStatus = z.infer<typeof appInvitationStatus>;
export type AppInvitationStatusInput = z.input<typeof appInvitationStatus>;

const createPersonalInvitationSchema = z.object({
	type: z.literal("personal"),
	name: z
		.string()
		.meta({
			description: "The name of the user to invite (Only for personal invitations)",
		})
		.optional(),
	email: z.string().meta({
		description: "The email address of the user to invite (Only for personal invitations)",
	}),
	resend: z
		.boolean()
		.meta({
			description: "Resend the invitation email, if the user is already invited",
		})
		.optional(),
});

const createPublicInvitationSchema = z.object({
	type: z.literal("public"),
	domainWhitelist: z
		.string()
		.or(z.string().array())
		.meta({
			description:
				"A comma separated list of domains that are allowed to accept the invitation. (Only for public invitations)",
		})
		.optional(),
});

export const createInvitationSchema = z.discriminatedUnion("type", [
	createPersonalInvitationSchema,
	createPublicInvitationSchema,
]);

export type CreateInvitation = z.infer<typeof createInvitationSchema>;
