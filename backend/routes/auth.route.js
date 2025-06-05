import express from 'express';
import passport from 'passport';
import { 
  githubAuth, 
  githubCallback, 
  getCurrentUser, 
  refreshToken, 
  logoutUser, 
  getUserProfile,
  fetchUserTechStack,
  generateReposWithAi 
} from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// OAuth routes
router.get('/github', githubAuth);
router.get('/github/callback', passport.authenticate('github', {
  session: false,
  failureRedirect: `${process.env.CLIENT_URL}/login`
}), githubCallback);

// User routes
router.get('/user', authenticateJWT, getCurrentUser);
router.post('/refresh', authenticateJWT, refreshToken);
router.post('/logout', logoutUser);

// Fixed: Separate routes for different functionalities
router.get('/user/profile/:id', authenticateJWT, getUserProfile);
router.get('/user/tech-stack/:username', authenticateJWT, fetchUserTechStack);
router.get('/user/generate-repos/:username/:id', authenticateJWT, generateReposWithAi);

export default router;