import { create } from 'zustand';
import API_CALL from '../api/API_CALL';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  fetchProfile: async () => {
    try {
      const data = await API_CALL('/users/me');
      set({ user: data, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const data = await API_CALL('/auth/login', 'POST', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      await get().fetchProfile();
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, loading: false });
    // כאן כדאי גם לאפס את הסטור של הלמידה (נראה בהמשך)
  },

  init: async () => {
    const token = localStorage.getItem('token');
    if (token) await get().fetchProfile();
    else set({ user: null, loading: false });
  },
}));

export default useAuthStore;