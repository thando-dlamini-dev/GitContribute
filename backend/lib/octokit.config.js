import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: req.user.accessToken
});

// Fetch user's repos
export const fetchRepos = async () => {
    try {
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 30
        });

        return repos
    } catch (error) {
        console.log("Error fetching repos:", error);
        return [];
    }
}



// Search repos by parameters
export const searchReposByStack = async (stack) => {
    try {
        const { data: searchResults } = await octokit.rest.search.repos({
        q: `user:${username} language:javascript`,
        sort: 'stars',
        order: 'desc'
        });

        return searchResults
    } catch (error) {
        console.log("Error searching repos by stack:", error);
        return [];
    }
}

