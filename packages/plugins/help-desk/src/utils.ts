import {
	getAdditionalPluginFields,
	getPlugin,
	tryCatch,
} from "@better-auth-extended/internal-utils";
import type { HelpDeskOptions } from "./types";
import { mergeSchema } from "better-auth/db";
import { schema } from "./schema";
import type { GenericEndpointContext } from "better-auth/types";
import type { admin } from "better-auth/plugins";

export const getAdditionalFields = <O extends HelpDeskOptions>(options: O) => ({
	ticket: getAdditionalPluginFields("ticket")(options, false),
	ticketReaction: getAdditionalPluginFields("ticketReaction")(options, false),
	ticketParticipant: getAdditionalPluginFields("ticketParticipant")(options, false),
	ticketLabel: getAdditionalPluginFields("ticketLabel")(options, false),
	ticketActivity: getAdditionalPluginFields("ticketActivity")(options, false),
});

export type AdditionalHelpDeskFields<O extends HelpDeskOptions> = ReturnType<
	typeof getAdditionalFields<O>
>;

export const getMergedSchema = (options: HelpDeskOptions) => {
	const mergedSchema = mergeSchema(schema, options.schema);
	mergedSchema.ticket.fields = {
		...mergedSchema.ticket.fields,
		...(options.schema?.ticket?.additionalFields ?? {}),
	};
	mergedSchema.ticketActivity.fields = {
		...mergedSchema.ticketActivity.fields,
		...(options.schema?.ticketActivity?.additionalFields ?? {}),
	};
	mergedSchema.ticketLabel.fields = {
		...mergedSchema.ticketLabel.fields,
		...(options.schema?.ticketLabel?.additionalFields ?? {}),
	};
	mergedSchema.ticketReaction.fields = {
		...mergedSchema.ticketReaction.fields,
		...(options.schema?.ticketReaction?.additionalFields ?? {}),
	};

	return mergedSchema;
};

export type AdminPlugin = ReturnType<typeof admin<any>>;

export const checkPermission = async (
	ctx: GenericEndpointContext,
	permissions: {
		[key: string]: string[];
	},
) => {
	const session = ctx.context.session;
	if (!session?.session) {
		throw ctx.error("UNAUTHORIZED");
	}

	const adminPlugin = getPlugin<AdminPlugin>(
		"admin" satisfies AdminPlugin["id"],
		ctx.context,
	);

	if (!adminPlugin) {
		throw ctx.error("FAILED_DEPENDENCY", {
			// TODO: Error codes
			message: "",
		});
	}

	const res = await tryCatch(
		adminPlugin.endpoints.userHasPermission({
			...ctx,
			body: {
				userId: session.user.id,
				permissions,
			},
			returnHeaders: true,
		}),
	);

	return res.data?.response.success ?? false;
};
