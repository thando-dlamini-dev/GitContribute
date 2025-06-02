import express from 'express';
import passport from 'passport';
import { githubAuth, githubCallback, getCurrentUser, refreshToken, logoutUser, getUserInfo, getUserProfile } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/github', githubAuth);
router.get('/github/callback', passport.authenticate('github', {
  session: false,
  failureRedirect: `${process.env.CLIENT_URL}/login`
}), githubCallback);
router.get('/user', authenticateJWT, getCurrentUser);
router.post('/refresh', authenticateJWT, refreshToken);
router.post('/logout', logoutUser);
router.get('/user/info', authenticateJWT, getUserInfo);
router.get('/user/user-profile/:username', authenticateJWT, getUserProfile);

export default router;