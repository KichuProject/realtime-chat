import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import { app,server } from './lib/socket.js';
import path from 'path';
dotenv.config();

console.log(process.env.MONGODB_URI);

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit:'10mb'}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/auth',authRoutes);
app.use('/api/messages',messageRoutes);
if(process.env.NODE_ENV === "production"){
    const distPath = path.join(__dirname,'../frontend/real-chat/dist');
    app.use(express.static(distPath));
    app.use((req,res,next)=>{
        if(req.method !== 'GET') return next();
        if(req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath,"index.html"));  
    });
}
server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    if(process.env.NODE_ENV === "production") {
        const distPath = path.join(__dirname,'../frontend/real-chat/dist');
        console.log('Production mode - serving static files from:', distPath);
    }
    connectDB();
});
