import type { GenericEndpointContext } from "better-auth";
import type { OnboardingOptions } from "./types";

export const getOnboardingAdapter = (
	options: OnboardingOptions<any, any>,
	ctx: GenericEndpointContext,
) => {
	return {
		getCompletedSteps: async (userId: string) => {
			let completedSteps: string[];
			if (options.secondaryStorage && ctx.context.secondaryStorage) {
				completedSteps =
					JSON.parse(
						String(
							await ctx.context.secondaryStorage.get(`onboarding:${userId}`),
						) ?? "{}",
					).completedSteps ?? [];
			} else {
				completedSteps = JSON.parse(
					(
						await ctx.context.adapter.findOne<{
							completedSteps?: string;
						}>({
							model: "user",
							where: [
								{
									field: "id",
									value: userId,
								},
							],
							select: ["completedSteps"],
						})
					)?.completedSteps ?? "[]",
				);
			}

			return new Set<string>(completedSteps);
		},
		updateOnboardingState: async (
			userId: string,
			data: Partial<{
				shouldOnboard: boolean | null;
				completedSteps: string[] | null;
			}>,
		) => {
			if (options.secondaryStorage && ctx.context.secondaryStorage) {
				const currentState = JSON.parse(
					String(
						await ctx.context.secondaryStorage.get(`onboarding:${userId}`),
					) ?? "{}",
				);
				const baseState = {
					shouldOnboard: false,
					completedSteps: [],
				};
				await ctx.context.secondaryStorage.set(`onboarding:${userId}`, {
					...baseState,
					...currentState,
					...data,
				});
			} else {
				await ctx.context.internalAdapter.updateUser(userId, {
					...data,
					completedSteps: Array.isArray(data.completedSteps)
						? JSON.stringify(data.completedSteps)
						: data.completedSteps,
				});
			}
		},
		getShouldOnboard: async (userId: string) => {
			if (options.secondaryStorage && ctx.context.secondaryStorage) {
				return (
					JSON.parse(
						String(
							await ctx.context.secondaryStorage.get(`onboarding:${userId}`),
						) ?? "{}",
					).shouldOnboard ?? false
				);
			}

			return (
				(
					await ctx.context.adapter.findOne<{ shouldOnboard?: boolean }>({
						model: "user",
						where: [
							{
								field: "id",
								value: userId,
							},
						],
						select: ["shouldOnboard"],
					})
				)?.shouldOnboard ?? false
			);
		},
	};
};
