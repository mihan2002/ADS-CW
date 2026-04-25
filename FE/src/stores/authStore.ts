import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/services/api/authApi';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  devLogin: () => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Login successful!');
    } catch (error: unknown) {
      set({ isLoading: false });
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  },

  devLogin: () => {
    const dummyUser: User = {
      id: 1,
      name: 'Dev Admin',
      email: 'admin@dev.local',
      age: 30,
      role: 'admin',
      is_email_verified: 1,
      last_login_at: new Date().toISOString(),
    };
    const dummyAccessToken = 'dev-access-token-dummy';
    const dummyRefreshToken = 'dev-refresh-token-dummy';

    localStorage.setItem('accessToken', dummyAccessToken);
    localStorage.setItem('refreshToken', dummyRefreshToken);
    localStorage.setItem('user', JSON.stringify(dummyUser));

    set({
      user: dummyUser,
      accessToken: dummyAccessToken,
      refreshToken: dummyRefreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    authApi.logout().catch(() => { /* silent */ });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });

    toast.success('Logged out successfully');
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  hydrate: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('user');
      }
    }
  },
}));
