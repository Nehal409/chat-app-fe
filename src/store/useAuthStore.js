import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // Check authentication from localStorage
  checkAuth: () => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      set({ authUser: { token: accessToken }, isCheckingAuth: false });
    } else {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  // Signup function
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);

      if (res.data?.data?.token) {
        console.log(res);

        localStorage.setItem("accessToken", res.data.data.token);
        set({ authUser: { token: res.data.data.token } });
        toast.success("Account created successfully");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      localStorage.setItem("accessToken", res.data.data.token);
      set({ authUser: { token: res.data.data.token } });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error?.response?.data?.error.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ authUser: null });
    toast.success("Logged out successfully");
  },
}));
