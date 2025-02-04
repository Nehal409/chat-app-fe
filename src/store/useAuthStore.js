import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

const BASE_URL = "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Check authentication and fetch user profile
  checkAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      set({ authUser: res.data.data.user, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.error("Error fetching profile:", error);
      localStorage.removeItem("accessToken");
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  // Signup function
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);

      if (res.data?.data?.token) {
        localStorage.setItem("accessToken", res.data.data.token);

        // Fetch user profile after signup
        await useAuthStore.getState().checkAuth();
        toast.success("Account created successfully");
        get().connectSocket();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login function
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      if (res.data?.data?.token) {
        localStorage.setItem("accessToken", res.data.data.token);

        // Fetch user profile after login
        await useAuthStore.getState().checkAuth();

        toast.success("Logged in successfully");
        get().connectSocket();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axiosInstance.put("/auth/profile", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      set({ authUser: res.data.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      toast.error(
        error?.response?.data?.error.message || "Update Profile failed"
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ authUser: null });
    toast.success("Logged out successfully");
    get().disconnectSocket();
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); // If the user is connected then only try to disconnect
  },
}));
