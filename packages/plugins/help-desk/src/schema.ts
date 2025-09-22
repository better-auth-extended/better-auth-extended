import { generateId, type AuthPluginSchema } from "better-auth";
import z from "zod";

export const defaultActivityTypes = [
	"locked",
	"titleChanged",
	"statusChanged",
	"labelsChanged",
	"assigned",
	"commented",
] as const;

export type DefaultActivityType = (typeof defaultActivityTypes)[number];

export const ticketSchema = z.object({
	id: z.string().default(generateId),
	authorId: z.string().nullish(),
	assigneeId: z.string().nullish(),
	title: z.string(),
	description: z.string().nullish(),
	status: z.string(),
	locked: z.boolean().default(false),
	updatedAt: z.date().default(() => new Date()),
	createdAt: z.date().default(() => new Date()),
});
export type Ticket = z.infer<typeof ticketSchema>;
export type TicketInput = z.input<typeof ticketSchema>;

export const ticketReactionSchema = z.object({
	id: z.string().default(generateId),
	identifier: z.string(),
	userId: z.string(),
	type: z.string(),
});
export type TicketReaction = z.infer<typeof ticketReactionSchema>;
export type TicketReactionInput = z.input<typeof ticketReactionSchema>;

export const ticketLabelSchema = z.object({
	id: z.string().default(generateId),
	ticketId: z.string(),
	label: z.string(),
});
export type TicketLabel = z.infer<typeof ticketLabelSchema>;
export type TicketLabelInput = z.input<typeof ticketLabelSchema>;

export const ticketParticipantSchema = z.object({
	id: z.string().default(generateId),
	ticketId: z.string(),
	userId: z.string().nullish(),
	lastSeenAt: z.date().default(() => new Date()),
	createdAt: z.date().default(() => new Date()),
});
export type TicketParticipant = z.infer<typeof ticketParticipantSchema>;
export type TicketParticipantInput = z.input<typeof ticketParticipantSchema>;

export const ticketActivitySchema = z.object({
	id: z.string().default(generateId),
	ticketId: z.string(),
	actorId: z.string().nullish(),
	type: z.string(),
	oldValue: z.string().nullish(),
	newValue: z.string().nullish(),
	content: z.string().nullish(),
	metadata: z.string().nullish(),
	updatedAt: z.date().default(() => new Date()),
	createdAt: z.date().default(() => new Date()),
});
export type TicketActivity = z.infer<typeof ticketActivitySchema>;
export type TicketActivityInput = z.input<typeof ticketActivitySchema>;

export const schema = {
	ticket: {
		fields: {
			authorId: {
				type: "string",
				required: false,
				references: {
					model: "user",
					field: "id",
					onDelete: "set null",
				},
			},
			assigneeId: {
				type: "string",
				required: false,
				references: {
					model: "user",
					field: "id",
					onDelete: "set null",
				},
			},
			title: {
				type: "string",
				sortable: true,
			},
			description: {
				type: "string",
				sortable: true,
				required: false,
			},
			status: {
				type: "string",
			},
			locked: {
				type: "boolean",
			},
			updatedAt: {
				type: "date",
				required: true,
				input: false,
				onUpdate: () => new Date(),
			},
			createdAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: () => new Date(),
			},
		},
	},
	ticketReaction: {
		fields: {
			identifier: {
				type: "string",
			},
			userId: {
				type: "string",
				references: {
					model: "user",
					field: "id",
				},
			},
			type: {
				type: "string",
			},
		},
	},
	ticketLabel: {
		fields: {
			ticketId: {
				type: "string",
			},
			label: {
				type: "string",
			},
		},
	},
	ticketParticipant: {
		fields: {
			ticketId: {
				type: "string",
				required: true,
				references: {
					model: "ticket",
					field: "id",
				},
			},
			userId: {
				type: "string",
				required: true,
				references: {
					model: "user",
					field: "id",
				},
			},
			lastSeenAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: () => new Date(),
			},
			createdAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: () => new Date(),
			},
		},
	},
	ticketActivity: {
		fields: {
			ticketId: {
				type: "string",
				references: {
					model: "ticket",
					field: "id",
				},
			},
			actorId: {
				type: "string",
				required: false,
				references: {
					model: "user",
					field: "id",
					onDelete: "set null",
				},
			},
			type: {
				type: "string",
				required: true,
			},
			oldValue: {
				type: "string",
				sortable: true,
				required: false,
			},
			newValue: {
				type: "string",
				sortable: true,
				required: false,
			},
			content: {
				type: "string",
				sortable: true,
				required: false,
			},
			metadata: {
				type: "string",
				sortable: true,
				required: false,
			},
			updatedAt: {
				type: "date",
				required: true,
				input: false,
				onUpdate: () => new Date(),
			},
			createdAt: {
				type: "date",
				required: true,
				input: false,
				defaultValue: () => new Date(),
			},
		},
	},
} satisfies AuthPluginSchema;
