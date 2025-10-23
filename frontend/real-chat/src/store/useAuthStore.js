import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios'
import {create} from 'zustand'
import {io} from 'socket.io-client'

const BASE_URL= import.meta.env.MODE === 'development' ? "http://localhost:3000" : "/";

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers:[],
    socket:null,
    
    checkAuth:async () => {
        try {
            const res=await axiosInstance.get('/auth/check');
            set({authUser:res.data});
            get().connectSocket();
        } catch (error) {
            set({authUser:null});
        }
        finally{
            set({isCheckingAuth:false});
        }
    },

    sendOtp: async (email) => {
        try {
            if (!email) {
                toast.error('Email is required');
                return;
            }
            
            const res = await axiosInstance.post('/auth/send-otp', { email });
            toast.success(res.data.message || 'OTP sent to your email');
            return res.data;
        } catch (error) {
            console.error('sendOtp error', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            throw error;
        }
    },

    signUp:async (data) => {
        set({isSigningUp:true});
        try {
            const { fullName, email, password, phone, otp } = data || {};
            if (!fullName || !email || !password || !otp) {
                toast.error('All fields are required');
                return;
            }

            const payload = { 
                fullName: String(fullName).trim(), 
                email: String(email).trim(), 
                password: String(password), 
                phone: phone || '',
                otp: String(otp).trim()
            };
            
            const res = await axiosInstance.post('/auth/signup', payload);

            set({authUser:res.data});
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            set({isSigningUp:false});
        }
    },
    login:async (data) => {
        set({isLoggingIn:true});
        try {
            const res=await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
        finally{
            set({isLoggingIn:false});
        }
    },
    logout:async () => {
        try {
            await axiosInstance.get('/auth/logout');
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error("Something went wrong");
        }
    },
    updateProfile:async (data) => {
        set({isUpdatingProfile:true});
        try {
            const res=await axiosInstance.put('/auth/update-profile',data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            set({isUpdatingProfile:false});
        }
    },
    connectSocket: () => {
        const {authUser} = get();
        if(!authUser||get().socket?.connected) return;
        const socket=io(BASE_URL,{
            query: {userId: authUser._id},
        });
        socket.connect();
        set({socket:socket});
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers:userIds});
        });
    },
    disconnectSocket: () => {
        if(get().socket?.connected){
            get().socket.disconnect();
        }
    }
}));
