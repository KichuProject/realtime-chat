import express from 'express';
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js';
import { protectRoute, sendSms, verifyOtpMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.post('/send-otp', sendSms);
router.post('/signup', verifyOtpMiddleware, signup);
router.post('/login',login);
router.get('/logout',logout);

router.put('/update-profile',protectRoute,updateProfile);
router.get('/check',protectRoute,checkAuth);

export default router;