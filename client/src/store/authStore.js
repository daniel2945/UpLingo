import { create } from 'zustand';
import API_CALL from '../api/API_CALL';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  processUserData: (user) => {
    if (!user) return null;
    return {
      ...user,
      sandbox: user.sandbox || [],
      currentMissionOrder: user.currentMissionOrder || 1,
    };
  },

  fetchProfile: async () => {
    try {
      const data = await API_CALL('/users/me');
      set({ 
        user: get().processUserData(data), 
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error.message);
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const data = await API_CALL('/auth/login', 'POST', { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        await get().fetchProfile();
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (username, email, password) => {
    try {
      const data = await API_CALL('/auth/register', 'POST', { username, email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        await get().fetchProfile();
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, loading: false });
  },

  init: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await get().fetchProfile();
    } else {
      set({ user: null, loading: false });
    }
  },
}));

export default useAuthStore;
