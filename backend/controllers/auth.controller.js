import passport from "passport";
import { generateToken } from "../lib/passport.config.js";
import { fetchUserProfile } from "../lib/octokit.config.js";
import { findOrCreateUser } from "../models/user.model.js";

// GitHub OAuth authentication
export const githubAuth = passport.authenticate("github", {
  session: false,
  // Force re-approval to allow switching accounts
  forceReAuthenticate: true
});

// Handle GitHub callback
export const githubCallback = async (req, res) => {
  try {
    // Ensure we have the minimum required user data
    if (!req.user?.id) {
      throw new Error('Invalid user data from GitHub');
    }

    // Normalize the user data with fallbacks
    const normalizedUser = {
      id: req.user.id,
      username: req.user.username || req.user.id, // Fallback to ID if username missing
      displayName: req.user.displayName || req.user.username || 'GitHub User',
      email: req.user.email?.[0]?.value || null,
      avatar: req.user.profilePicture || req.user.photos?.[0]?.value || null,
      accessToken: req.user.accessToken
    };

    // Save or update user in database
    const dbUser = await findOrCreateUser(normalizedUser);

    // Generate token with complete data (using normalized values as fallbacks)
    const tokenUser = {
      id: dbUser.id,
      username: dbUser.username || normalizedUser.username,
      displayName: dbUser.display_name || normalizedUser.displayName,
      email: dbUser.email || normalizedUser.email,
      avatar: dbUser.avatar_url || normalizedUser.avatar
    };

    const token = generateToken(tokenUser);
    
    // Prepare user data for frontend with all fields guaranteed
    const userData = {
      token,
      user: {
        id: tokenUser.id,
        username: tokenUser.username,
        displayName: tokenUser.displayName,
        email: tokenUser.email,
        avatar: tokenUser.avatar,
        githubToken: normalizedUser.accessToken // Include GitHub token for immediate use
      }
    };
    
    // Redirect to frontend with user data
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
  // For JWT, the client removes the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

export const getUserProfile = async (req, res) => {
  try {
    const { id: username } = req.params; // Rename for clarity
    if (!username) {
      return res.status(400).json({success: false, message: "Username is required"});
    }
    const userProfile = await fetchUserProfile(username);
    res.status(200).json({success: true, message: "User profile fetched successfully", userProfile});
  } catch (error) {
    console.error("Error in getUserProfile endpoint:", error);
    res.status(500).json({success: false, message: "Error while fetching user profile", error: error.message});
  }
}

// Get user info from GitHub
export const getUserInfo = async (req, res) => {
  try {
    // Get user from JWT
    const user = req.user;
    
    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Initialize GitHub service with user's access token
    const githubService = new OctokitConfig(user.accessToken);
    
    // Get user information from GitHub
    const userData = await githubService.getUserInfo();
    
    return res.status(200).json({
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        avatar: userData.avatar,
        html_url: userData.html_url,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({
      error: 'Failed to fetch user information',
      details: error.message
    });
  }
};