import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await axiosInstance.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      set({ users: res.data.data.users });
    } catch (error) {
      toast.error(error?.response?.data?.error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axiosInstance.get(`/messages/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      set({ messages: res.data.data.messages });
    } catch (error) {
      toast.error(error?.response?.data?.error.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
