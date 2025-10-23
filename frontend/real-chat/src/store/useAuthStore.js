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
    _isLocal10: (phone) => {
        if (!phone || typeof phone !== 'string') return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length === 10;
    },
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

    signUp:async (data) => {
    set({isSigningUp:true});
    try {
        if (!data?.phone || !data?.code) {
            toast.error('Phone and OTP code are required');
            return;
        }
        if (!get()._isLocal10(data.phone)) {
            toast.error('Please enter a 10-digit phone number');
            return;
        }
        const payload = { ...data, phone: String(data.phone).replace(/\D/g, '') };

        const res=await axiosInstance.post('/auth/signup', payload);
        set({authUser:res.data});
        toast.success("Account created successfully");
        get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
        finally{
            set({isSigningUp:false});
        }
    },
    sendOtp: async (phone) => {
        try {
            if (!phone) {
                toast.error('Phone is required');
                return;
            }
            if (!get()._isLocal10(phone)) {
                toast.error('Please enter a 10-digit phone number');
                return;
            }
            const digitsOnly = String(phone).replace(/\D/g, '');
            const res = await axiosInstance.post('/auth/send-otp', { phone: digitsOnly });
            toast.success(res.data?.message || 'OTP sent');
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            throw error;
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
