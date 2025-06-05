import passport from "passport";
import { generateToken } from "../lib/passport.config.js";
import { fetchUserProfile, getUserRepoData, searchReposOnGitHub } from "../lib/octokit.config.js";
import { findOrCreateUser } from "../models/user.model.js";
import { generateContributionRepos } from "../lib/huggingFace.config.js";

// GitHub OAuth authentication
export const githubAuth = passport.authenticate("github", {
  session: false,
  forceReAuthenticate: true
});

// Handle GitHub callback
export const githubCallback = async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('Invalid user data from GitHub');
    }

    const normalizedUser = {
      id: req.user.id,
      username: req.user.username || req.user.id,
      displayName: req.user.displayName || req.user.username || 'GitHub User',
      email: req.user.email?.[0]?.value || null,
      avatar: req.user.profilePicture || req.user.photos?.[0]?.value || null,
      accessToken: req.user.accessToken
    };

    const dbUser = await findOrCreateUser(normalizedUser);

    const tokenUser = {
      id: dbUser.id,
      username: dbUser.username || normalizedUser.username,
      displayName: dbUser.display_name || normalizedUser.displayName,
      email: dbUser.email || normalizedUser.email,
      avatar: dbUser.avatar_url || normalizedUser.avatar,
      accessToken: normalizedUser.accessToken
    };

    const token = generateToken(tokenUser);
    
    const userData = {
      token,
      user: {
        id: tokenUser.id,
        username: tokenUser.username,
        displayName: tokenUser.displayName,
        email: tokenUser.email,
        avatar: tokenUser.avatar,
        githubToken: normalizedUser.accessToken
      }
    };
    
    const redirectUrl = `${process.env.CLIENT_URL}/login/success?data=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
};

// Get current authenticated user
export const getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      avatar: req.user.avatar
    }
  });
};

// Refresh JWT token
export const refreshToken = (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ token: newToken });
};

// Handle user logout
export const logoutUser = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userToken = req.user?.accessToken;
    
    if (!userToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token not found. Please re-authenticate.'
      });
    }
    
    console.log("Fetching user profile for user ID:", id);
    const userProfile = await fetchUserProfile(id, userToken);
    
    res.status(200).json({
      success: true, 
      message: "User profile fetched successfully", 
      userProfile
    });
  } catch (error) {
    console.error("Error in getUserProfile endpoint:", error);
    
    if (error.message.includes('rate limit')) {
      res.status(429).json({
        success: false, 
        message: "GitHub API rate limit exceeded. Please try again later.", 
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false, 
        message: "Error while fetching user profile", 
        error: error.message
      });
    }
  }
};

export const fetchUserTechStack = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({
        success: false, 
        message: "Username is required"
      });
    }

    console.log("Fetching techStack for user: ", username);

    const userToken = req.user?.accessToken;
    if (!userToken) {
      return res.status(401).json({
        success: false, 
        message: "GitHub access token not found. Please re-authenticate."
      });
    }

    const techStack = await getUserRepoData(username, userToken);
    
    return res.status(200).json({
      success: true,
      message: "Tech stack fetched successfully",
      techStack: techStack.techStack
    });

  } catch (error) {
    console.error("Error in fetchUserTechStack endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user tech stack",
      error: error.message
    });
  }
};

// Fixed: Removed unused getUserInfo function and fixed generateReposWithAi
export const generateReposWithAi = async (req, res) => {
  try {
    const { username, id } = req.params;
    
    if (!username || !id) {
      return res.status(400).json({
        success: false,
        message: "Username and ID are required"
      });
    }

    const userToken = req.user?.accessToken;
    if (!userToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token not found. Please re-authenticate."
      });
    }

    // Fetch tech stack
    const techStackData = await getUserRepoData(username, userToken);
    console.log("User Tech stack: ", techStackData.techStack);
    
    // Fetch user profile
    const userProfile = await fetchUserProfile(id, userToken);
    console.log("User Profile: ", userProfile);
    
    // Search for repos
    const repos = await searchReposOnGitHub(techStackData.techStack, 10, userToken);
    
    console.log("Repos fetched: ", repos);
    // Generate AI recommendations
    const generatedRepos = await generateContributionRepos(techStackData.techStack, userProfile, repos);
    console.log("Repos generated by AI: ", generatedRepos);

    return res.status(200).json({
      success: true,
      message: "Repos generated successfully",
      techStack: techStackData.techStack,
      userProfile,
      repos,
      generatedRepos
    });
    
  } catch (error) {
    console.error(`Error in generateReposWithAi endpoint: ${error}`);
    return res.status(500).json({
      success: false, 
      message: "Error while generating repos", 
      error: error.message
    });
  }
};