import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    const {fullName, email, password, phone} = req.body;
    try {
        if(!fullName || !email || !password || !phone){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }
        
        const verifiedEmail = req.verifiedEmail || email;
        
        const user= await User.findOne({email: verifiedEmail});
        if(user){
            return res.status(400).json({message: "Email already exists"});
        }
        
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser= new User({fullName, email: verifiedEmail, password: hashedPassword, phone: phone || ''});
        
        if(newUser){
            generateToken(newUser._id,res);
            const savedUser= await newUser.save();
            return res.status(201).json({
                _id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                profilepic: savedUser.profilepic,
                phone: savedUser.phone,
            });
        } else {
            return res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.error(error);
        if (error?.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `${field} already exists` });
        }
        if (error?.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', details: error.message });
        }
        return res.status(500).json({message: "Internal server error"});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        generateToken(user._id,res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilepic: user.profilepic,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
    
}

export const updateProfile = async (req, res) => {
    try {
        const {profilepic} = req.body;
        const userId = req.user._id;
        if(!profilepic){
            return res.status(400).json({message: "Profile picture is required"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilepic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilepic: uploadResponse.secure_url}, {new: true});
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
}