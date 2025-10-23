import express from 'express';
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js';
import { protectRoute, verifyOtp, sendOtp } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.post('/send-otp', sendOtp);
router.post('/signup', verifyOtp, signup);
router.post('/login',login);
router.get('/logout',logout);

router.put('/update-profile',protectRoute,updateProfile);
router.get('/check',protectRoute,checkAuth);

export default router;