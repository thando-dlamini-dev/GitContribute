import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const usesAuthStore = create((set) => ({
    user: null,
    loading: false,
    login: async () => {
        try {
            const response = await axios.post("/api/auth/login");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    fetchUserProfile: async (user) => {
        try {
            console.log("Fetching user profile for user. ", "User ID: ", user.id, "Username:", user.username);
            set({loading: true})
            const response = await axios.get(`/api/auth/user-profile/${user.id}`);
            set({userProfile: response.data.userProfile, loading: false})
        } catch (error) {
            set({loading: false})
            console.log("Error in fetchUserProfile endpoint:", error);
            toast.error(error.response.data.message);
        }
    }
}))