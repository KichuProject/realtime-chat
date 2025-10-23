import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendOtpEmail } from '../lib/email.js';

const otpStore = new Map();

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const otp = generateOTP();
        
        otpStore.set(email, {
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000 
        });

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('sendOtp error:', error);
        const message = error.message === 'Invalid email address' 
            ? 'Invalid email address' 
            : 'Failed to send OTP';
        res.status(400).json({ message });
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (stored.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        otpStore.delete(email);
        
        req.verifiedEmail = email;
        next();
    } catch (error) {
        console.error('verifyOtp error:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Not authorized, no token"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: "Not authorized, Invalid token"});
        }
        const user = await User.findById(decoded.userID).select('-password');
        if(!user){
            return res.status(401).json({message: "User not found"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }

}