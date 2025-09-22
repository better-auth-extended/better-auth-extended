import { App, Octokit } from "octokit";

export const repo = "better-auth-extended";
export const owner = "jslno";
export const DocsCategory = "Docs Feedback";

let instance: Octokit | undefined;

export const getOctokit = async () => {
	if (instance) {
		return instance;
	}

	const appId = process.env.GITHUB_APP_ID;
	const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

	if (!appId || !privateKey) {
		throw new Error(
			"No GitHub keys provided for GitHub App, feedback feature will not work.",
		);
	}

	const app = new App({
		appId,
		privateKey,
	});

	const { data } = await app.octokit.request(
		"GET /repos/{owner}/{repo}/installation",
		{
			owner,
			repo,
			headers: {
				"X-GitHub-Api-Version": "2022-11-28",
			},
		},
	);

	instance = await app.getInstallationOctokit(data.id);
	return instance;
};

type RepositoryInfo = {
	id: string;
	discussionCategories: {
		nodes: {
			id: string;
			name: string;
		}[];
	};
};

let cachedDestination: RepositoryInfo | undefined;
export const getFeedbackDestination = async () => {
	if (cachedDestination) {
		return cachedDestination;
	}
	const octokit = await getOctokit();

	const {
		repository,
	}: {
		repository: RepositoryInfo;
	} = await octokit.graphql(`
      query {
        repository(owner: "${owner}", name: "${repo}") {
          id
          discussionCategories(first: 25) {
            nodes { id name }
          }
        }
      }
    `);

	return (cachedDestination = repository);
};
