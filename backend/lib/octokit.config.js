import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

// Create enhanced Octokit instance with throttling
const MyOctokit = Octokit.plugin(throttling);

// File extension to tech mapping
const techStackMap = {
  // Frontend
  '.js': 'JavaScript',
  '.jsx': 'React',
  '.ts': 'TypeScript',
  '.tsx': 'React with TypeScript',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.css': 'CSS',
  '.scss': 'Sass',
  '.less': 'Less',
  '.html': 'HTML',
  '.htm': 'HTML',
  
  // Backend
  '.py': 'Python',
  '.java': 'Java',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.rs': 'Rust',
  
  // Mobile
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.dart': 'Dart',
  
  // Databases
  '.sql': 'SQL',
  '.graphql': 'GraphQL',
  
  // Config/build
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.lock': 'Lock file',
  '.sh': 'Shell Script',
  '.bat': 'Batch Script',
  
  // Other
  '.md': 'Markdown',
  '.txt': 'Text',
};

// Create Octokit instance with user's token
const createOctokitInstance = (userToken = null) => {
  return new Octokit({
    auth: userToken || process.env.GITHUB_TOKEN
  });
};

export const fetchUserProfile = async (userId, userToken = null) => {
  try {
    console.log("Fetching user profile for user ID:", userId);
    
    const octokit = createOctokitInstance(userToken);
    
    // Use getById for numeric GitHub user IDs
    const response = await octokit.users.getById({
      user_id: parseInt(userId) // GitHub API expects a number
    });
    
    return response.data;
  } catch (error) {
    console.error("Octokit error:", error.message);
    
    // More specific error messages
    if (error.message.includes('rate limit')) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    } else if (error.status === 404) {
      throw new Error("User not found on GitHub.");
    } else {
      throw new Error("Failed to fetch user profile: " + error.message);
    }
  }
}

export const getUserRepoData = async (username, userToken = null) => {
  try {
    const octokit = createOctokitInstance(userToken);

    // Get user's repositories
    const repos = await octokit.paginate(octokit.repos.listForUser, {
      username,
      per_page: 100,
    });

    const techStack = new Set();
    const extensionCounts = {};

    // Limit the number of repos to analyze for performance
    const reposToAnalyze = repos.slice(0, 3); // Reduced from 5 to 3 for faster response

    for (const repo of reposToAnalyze) {
      if (repo.fork) continue; // Skip forks

      try {
        console.log(`Analyzing repo: ${repo.name}`);
        
        // Use Git Trees API for much faster recursive file listing
        // This gets ALL files in one API call instead of one call per directory
        const tree = await octokit.git.getTree({
          owner: repo.owner.login,
          repo: repo.name,
          tree_sha: repo.default_branch,
          recursive: true, // This is the key - gets all files recursively in one call
        });

        // Process each file from the tree
        for (const item of tree.data.tree) {
          if (item.type === 'blob' && item.path) { // 'blob' means file
            const filename = item.path.split('/').pop(); // Get filename from path
            
            if (filename && filename.includes('.')) {
              const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
              
              if (techStackMap[extension]) {
                const tech = techStackMap[extension];
                techStack.add(tech);
                extensionCounts[extension] = (extensionCounts[extension] || 0) + 1;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing repo ${repo.name}:`, error.message || error);
        // If Git Trees API fails, try the slower Contents API as fallback
        try {
          console.log(`Fallback: Using Contents API for ${repo.name}`);
          const fallbackFiles = await getFallbackFiles(octokit, repo.owner.login, repo.name, repo.default_branch);
          
          for (const file of fallbackFiles) {
            if (file.name && file.name.includes('.')) {
              const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
              
              if (techStackMap[extension]) {
                const tech = techStackMap[extension];
                techStack.add(tech);
                extensionCounts[extension] = (extensionCounts[extension] || 0) + 1;
              }
            }
          }
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${repo.name}:`, fallbackError.message);
        }
      }
    }

    // Convert to sorted array by frequency
    const sortedTechStack = Array.from(techStack).sort((a, b) => {
      const extA = Object.entries(techStackMap).find(([_, value]) => value === a)?.[0];
      const extB = Object.entries(techStackMap).find(([_, value]) => value === b)?.[0];
      return (extensionCounts[extB] || 0) - (extensionCounts[extA] || 0);
    });

    return {
      username,
      totalRepos: repos.length,
      analyzedRepos: reposToAnalyze.length,
      techStack: sortedTechStack,
      extensionCounts,
    };
  } catch (error) {
    console.error(`Error fetching data for user ${username}:`, error.message || error);
    throw error;
  }
};

// Fallback function for when Git Trees API fails (limited recursive depth for performance)
const getFallbackFiles = async (octokit, owner, repo, branch, path = '', depth = 0, maxDepth = 2) => {
  if (depth > maxDepth) return []; // Limit recursion depth for performance
  
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const files = [];
    const items = Array.isArray(response.data) ? response.data : [response.data];

    for (const item of items) {
      if (item.type === 'file') {
        files.push(item);
      } else if (item.type === 'dir' && depth < maxDepth) {
        // Only recurse if we haven't hit max depth
        const subFiles = await getFallbackFiles(octokit, owner, repo, branch, item.path, depth + 1, maxDepth);
        files.push(...subFiles);
      }
    }

    return files;
  } catch (error) {
    console.error(`Error in fallback for ${path}:`, error.message);
    return [];
  }
};

// Additional helper function to get just the tech stack
export const getUserTechStack = async (username, userToken = null) => {
  const repoData = await getUserRepoData(username, userToken);
  return repoData.techStack;
};