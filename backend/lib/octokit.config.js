import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export const fetchUserProfile = async (user) => {
  const { id, username } = user
  console.log("Fetching user profile for user. ", "User ID: ", id, "Username:", username);
  const userProfile = await octokit.users.getById(id)

}

// Method 1: Search by Topics (Recommended)
export const searchReposByStack = async (stack, username = null) => {
  try {
    let query = '';
    
    // Build query based on stack
    if (Array.isArray(stack)) {
      // Multiple technologies: ['react', 'nodejs', 'mongodb']
      const topics = stack.map(tech => `topic:${tech.toLowerCase()}`).join(' ');
      query = topics;
    } else {
      // Single technology
      query = `topic:${stack.toLowerCase()}`;
    }
    
    // Add user filter if specified
    if (username) {
      query += ` user:${username}`;
    }

    const { data: searchResults } = await octokit.rest.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 30
    });

    return searchResults;
  } catch (error) {
    console.log("Error searching repos by stack:", error);
    return { items: [], total_count: 0 };
  }
};

// Method 2: Search by Language + Keywords in Description
export const searchReposByTechStack = async (primaryLang, keywords, username = null) => {
  try {
    let query = `language:${primaryLang}`;
    
    // Add keywords that might be in description/readme
    if (Array.isArray(keywords)) {
      keywords.forEach(keyword => {
        query += ` ${keyword}`;
      });
    }
    
    // Add user filter
    if (username) {
      query += ` user:${username}`;
    }

    const { data: searchResults } = await octokit.rest.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 30
    });

    return searchResults;
  } catch (error) {
    console.log("Error searching repos by tech stack:", error);
    return { items: [], total_count: 0 };
  }
};

// Method 3: Advanced Stack Search with Multiple Filters
export const advancedStackSearch = async (searchOptions) => {
  const {
    languages = [],      // ['javascript', 'python']
    topics = [],         // ['react', 'nodejs', 'mongodb']
    keywords = [],       // ['fullstack', 'web-app']
    username = null,
    minStars = 0,
    maxSize = null,      // Repository size in KB
    created = null,      // 'YYYY-MM-DD' or '>YYYY-MM-DD'
    pushed = null        // 'YYYY-MM-DD' or '>YYYY-MM-DD'
  } = searchOptions;

  try {
    let queryParts = [];

    // Add languages (OR condition)
    if (languages.length > 0) {
      if (languages.length === 1) {
        queryParts.push(`language:${languages[0]}`);
      } else {
        const langQuery = languages.map(lang => `language:${lang}`).join(' OR ');
        queryParts.push(`(${langQuery})`);
      }
    }

    // Add topics (AND condition)
    topics.forEach(topic => {
      queryParts.push(`topic:${topic.toLowerCase()}`);
    });

    // Add keywords (search in name, description, readme)
    keywords.forEach(keyword => {
      queryParts.push(`"${keyword}"`);
    });

    // Add user filter
    if (username) {
      queryParts.push(`user:${username}`);
    }

    // Add star filter
    if (minStars > 0) {
      queryParts.push(`stars:>=${minStars}`);
    }

    // Add size filter
    if (maxSize) {
      queryParts.push(`size:<=${maxSize}`);
    }

    // Add date filters
    if (created) {
      queryParts.push(`created:${created}`);
    }
    if (pushed) {
      queryParts.push(`pushed:${pushed}`);
    }

    const query = queryParts.join(' ');
    console.log('Search query:', query);

    const { data: searchResults } = await octokit.rest.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 50
    });

    return searchResults;
  } catch (error) {
    console.log("Error in advanced stack search:", error);
    return { items: [], total_count: 0 };
  }
};

// Method 4: Popular Stack Combinations
export const searchPopularStacks = async (stackName) => {
  const stackQueries = {
    'mern': 'topic:react topic:nodejs topic:mongodb topic:express',
    'mean': 'topic:angular topic:nodejs topic:mongodb topic:express',
    'lamp': 'language:php topic:apache topic:mysql topic:linux',
    'django': 'language:python topic:django',
    'rails': 'language:ruby topic:rails',
    'vue': 'topic:vue topic:nodejs',
    'next': 'topic:nextjs topic:react',
    'nuxt': 'topic:nuxtjs topic:vue',
    'flutter': 'language:dart topic:flutter',
    'react-native': 'topic:react-native language:javascript',
    'spring': 'language:java topic:spring',
    'dotnet': 'language:c# topic:dotnet',
    'laravel': 'language:php topic:laravel'
  };

  const query = stackQueries[stackName.toLowerCase()];
  if (!query) {
    throw new Error(`Stack "${stackName}" not found. Available: ${Object.keys(stackQueries).join(', ')}`);
  }

  try {
    const { data: searchResults } = await octokit.rest.search.repos({
      q: query + ' stars:>=10', // Filter for quality repos
      sort: 'stars',
      order: 'desc',
      per_page: 20
    });

    return searchResults;
  } catch (error) {
    console.log(`Error searching ${stackName} stack:`, error);
    return { items: [], total_count: 0 };
  }
};


export const extractRepoData = (repo) => {
    if (!repo) {
      return null;
    }

    return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    topics: repo.topics || [],
    owner: {
      login: repo.owner.login,
      avatar: repo.owner.avatar_url,
      type: repo.owner.type
    },
    dates: {
      created: repo.created_at,
      updated: repo.updated_at,
      lastPush: repo.pushed_at
    },
    settings: {
      private: repo.private,
      fork: repo.fork,
      archived: repo.archived,
      hasIssues: repo.has_issues,
      hasWiki: repo.has_wiki
    },
    license: repo.license?.name || 'No license',
    size: repo.size
  };
}