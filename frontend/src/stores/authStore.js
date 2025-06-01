import { create } from "zustand";
import api from "../lib/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { persist } from "zustand/middleware";

const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    // Refresh if token expires in less than 15 minutes
    if (decoded.exp * 1000 - Date.now() < 900000) {
      const response = await api.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

const useAuthStore = create(
    persist(
        (set) => {
            return ({
    user: null,
    loading: false,
    token: null,
    isAuthenticated: false,
    initialize: async () => {
          try {
            const token = localStorage.getItem('token');

            if (!token) {
              set({isLoading: false});
              return;
            }

            const decoded = jwtDecode(token);
            console.log(decoded)

            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
              await refreshToken();
              // Re-check after refresh attempt
              const newToken = localStorage.getItem('token');
              if (!newToken) throw new Error('Token refresh failed');

              const newDecoded = jwtDecode(newToken);
              set({
                user: {
                  id: newDecoded.id,
                  username: newDecoded.username,
                  avatar: newDecoded.avatar
                },
                token: newToken,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              set({
                user: {
                  id: decoded.id,
                  username: decoded.username,
                  avatar: decoded.avatar
                },
                token,
                isAuthenticated: true,
                isLoading: false
              });
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
            localStorage.removeItem('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
        }
    },

    loginWithGitHub: () => {
          // Clear any existing tokens and state before login
          localStorage.removeItem('token');

          // Add timestamp to prevent caching of the auth request
          const timestamp = new Date().getTime();

          window.location.href = `http://localhost:5000/api/auth/github?t=${timestamp}`;
    },

    fetchUserProfile: async (user) => {
        try {
            console.log("Fetching user profile for user. ", "User ID: ", user.id, "Username:", user.username);
            set({loading: true})
            const response = await api.get(`/api/auth/user-profile/${user.id}`);
            set({userProfile: response.data.userProfile, loading: false})
        } catch (error) {
            set({loading: false})
            console.log("Error in fetchUserProfile endpoint:", error);
            toast.error(error.response.data.message);
        }
    },

    setupTokenRefresh: () => {
          // Initial check
          refreshToken();
          // Check every 10 minutes
          const interval = setInterval(refreshToken, 600000);
          return () => clearInterval(interval);
    }

    })
    },
    {
        name: 'auth-store',
        partialize: (state) => ({ token: state.token }), // Only persist token to localStorage
    }
 )
)

export default useAuthStore