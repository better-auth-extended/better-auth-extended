import type { AuthContext, User, Where } from "better-auth";
import type { AppInviteOptions } from "./types";
import type {
	AppInvitation,
	AppInvitationInput,
	AppInvitationStatus,
	CreateInvitation,
} from "./schema";
import { getDate } from "@better-auth-extended/internal-utils";

type WithAdditionalFields<
	T,
	AdditionalFields extends Record<string, any> = Record<string, any>,
> = T & {
	additionalFields?: {} | AdditionalFields;
};

export const getAppInviteAdapter = (
	context: AuthContext,
	options?: AppInviteOptions,
) => {
	const adapter = context.adapter;

	return {
		createInvitation: async <AdditionalFields extends Record<string, any>>(
			invitation: WithAdditionalFields<CreateInvitation, AdditionalFields>,
			user: User,
		) => {
			const defaultExpiration = 1000 * 60 * 60 * 48;
			const expiresAt =
				options?.invitationExpiresIn === null
					? undefined
					: getDate(options?.invitationExpiresIn || defaultExpiration);

			const newInvite = await adapter.create<AppInvitationInput, AppInvitation>(
				{
					model: "appInvitation",
					data: {
						inviterId: user.id,
						status: "pending",
						expiresAt,
						...(invitation.type === "personal"
							? {
									name: invitation.name,
									email: invitation.email,
								}
							: {
									domainWhitelist: Array.isArray(invitation.domainWhitelist)
										? invitation.domainWhitelist.join(",")
										: invitation.domainWhitelist,
								}),
						...invitation.additionalFields,
					},
				},
			);

			const data = {
				...newInvite,
			} as AppInvitation & AdditionalFields;

			return data;
		},
		findInvitationById: async <AdditionalFields extends Record<string, any>>(
			id: string,
			data?: {
				where?: Where[];
			},
		) => {
			const invitation = await adapter.findOne<
				AppInvitation & AdditionalFields
			>({
				model: "appInvitation",
				where: [
					{
						field: "id",
						value: id,
					},
					...(data?.where ?? []),
				],
			});
			return invitation;
		},
		findInvitationByEmail: async <AdditionalFields extends Record<string, any>>(
			email: string,
			data?: {
				where?: Where[];
			},
		) => {
			const invitation = await adapter.findOne<
				AppInvitation & AdditionalFields
			>({
				model: "appInvitation",
				where: [
					{
						field: "email",
						value: email,
					},
					...(data?.where ?? []),
				],
			});
			return invitation;
		},
		updateInvitation: async <AdditionalFields extends Record<string, any>>(
			id: string,
			status: Exclude<AppInvitationStatus, "pending">,
		) => {
			const invitation = await adapter.update<AppInvitation & AdditionalFields>(
				{
					model: "appInvitation",
					where: [
						{
							field: "id",
							value: id,
						},
					],
					update: {
						status,
					},
				},
			);
			return invitation;
		},
		listInvitations: async <
			AdditionalFields extends Record<string, any>,
		>(data?: {
			limit?: number;
			offset?: number;
			sortBy?: {
				field: string;
				direction: "asc" | "desc";
			};
			where?: Where[];
		}) => {
			return adapter.findMany<AppInvitation & AdditionalFields>({
				model: "appInvitation",
				...data,
			});
		},
		countInvitations: async (data?: { where?: Where[] }) => {
			return adapter.count({
				model: "appInvitation",
				...data,
			});
		},
		deleteInvitation: async (id: string) => {
			await adapter.delete({
				model: "appInvitation",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
		},
	};
};
