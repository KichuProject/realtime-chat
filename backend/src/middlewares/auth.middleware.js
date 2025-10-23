import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import twilio from 'twilio';

const otpStore = new Map();

const toLocal10 = (raw) => {
    if (!raw) return null;
    const digits = String(raw).replace(/\D/g, '');
    return digits.length === 10 ? digits : null;
};

const toE164 = (raw) => {
    const v = String(raw || '').trim();
    if (/^\+\d{10,15}$/.test(v)) return v;
    const local = toLocal10(v);
    const cc = process.env.DEFAULT_COUNTRY_CODE || '+91';
    return local ? `${cc}${local}` : null;
};

const twilioClient = (() => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    return twilio(sid, token);
})();

export const sendSms = async (req, res) => {
    try {
    const rawPhone = req.body.phone;
    if (!rawPhone) return res.status(400).json({ message: 'Phone number is required' });
    const local = toLocal10(rawPhone);
    if (!local) return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    const to = toE164(rawPhone);

        if (!twilioClient) return res.status(500).json({ message: 'Twilio not configured' });

        const from = process.env.TWILIO_PHONE_NUMBER;
        if (!from) return res.status(500).json({ message: 'TWILIO_PHONE_NUMBER not configured' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expires = Date.now() + 10 * 60 * 1000;
        otpStore.set(local, { otp, expires });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] OTP for ${local} (to ${to}): ${otp}`);
        }

    const messageBody = `Welcome to Peslamaa chat application. Your OTP is ${otp}. Expires in 10 minutes.`;
        const sent = await twilioClient.messages.create({ body: messageBody, from, to });

        return res.status(200).json({ message: 'OTP sent', sid: sent.sid });
    } catch (error) {
        console.error('sendSms error', error);
        const payload = { message: 'Failed to send OTP' };
        if (process.env.NODE_ENV !== 'production') {
            payload.error = error?.message || 'Unknown error';
            if (error?.code) payload.code = error.code;
            if (error?.moreInfo) payload.moreInfo = error.moreInfo;
        }
        return res.status(500).json(payload);
    }
};
export const verifyOtpMiddleware = async (req, res, next) => {
    try {
    const rawPhone = req.body.phone;
    const rawCode = req.body.code;
    if (!rawPhone || !rawCode) return res.status(400).json({ message: 'Phone and code are required' });

    const local = toLocal10(rawPhone);
    if (!local) return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    const code = String(rawCode).trim();

    const record = otpStore.get(local);
        if (!record) return res.status(401).json({ message: 'OTP not found or expired' });

        if (Date.now() > record.expires) {
            otpStore.delete(phone);
            return res.status(401).json({ message: 'OTP expired' });
        }

    if (record.otp !== code) return res.status(401).json({ message: 'Invalid OTP' });
    otpStore.delete(local);
    req.verifiedPhone = local;
        next();
    } catch (error) {
        console.error('verifyOtpMiddleware error', error);
        return res.status(500).json({ message: 'Error verifying OTP' });
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