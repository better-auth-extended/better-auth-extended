"use server";

import { ActionResponse, Feedback } from "@/components/feedback";
import {
	DocsCategory,
	getFeedbackDestination,
	getOctokit,
	owner,
	repo,
} from "./github";

export const onRateAction = async (
	url: string,
	feedback: Feedback,
): Promise<ActionResponse> => {
	const octokit = await getOctokit();
	const destination = await getFeedbackDestination();
	if (!octokit || !destination)
		throw new Error("GitHub comment integration is not configured.");

	const category = destination.discussionCategories.nodes.find(
		(category) => category.name === DocsCategory,
	);

	if (!category)
		throw new Error(
			`Please create a "${DocsCategory}" category in GitHub Discussion`,
		);

	const title = `Feedback for ${url}`;
	const body = `[${feedback.opinion}] ${feedback.message}\n\n> Forwarded from user feedback.`;

	let {
		search: {
			nodes: [discussion],
		},
	}: {
		search: {
			nodes: { id: string; url: string }[];
		};
	} = await octokit.graphql(`
            query {
              search(type: DISCUSSION, query: ${JSON.stringify(`${title} in:title repo:${owner}/${repo} author:@me`)}, first: 1) {
                nodes {
                  ... on Discussion { id, url }
                }
              }
            }`);

	if (discussion) {
		await octokit.graphql(`
              mutation {
                addDiscussionComment(input: { body: ${JSON.stringify(body)}, discussionId: "${discussion.id}" }) {
                  comment { id }
                }
              }`);
	} else {
		const result: {
			createDiscussion: {
				discussion: { id: string; url: string };
			};
		} = await octokit.graphql(`
              mutation {
                createDiscussion(input: { repositoryId: "${destination.id}", categoryId: "${category!.id}", body: ${JSON.stringify(body)}, title: ${JSON.stringify(title)} }) {
                  discussion { id, url }
                }
              }`);
		discussion = result.createDiscussion.discussion;
	}

	return {
		githubUrl: discussion.url,
	};
};
