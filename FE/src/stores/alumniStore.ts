import { create } from 'zustand';
import type { AlumniProfile, FullAlumniProfile } from '@/types';
import { alumniApi } from '@/services/api/alumniApi';

interface AlumniState {
  alumni: AlumniProfile[];
  fullProfiles: Record<number, FullAlumniProfile>;
  isLoading: boolean;
  error: string | null;

  fetchAllAlumni: () => Promise<void>;
  fetchFullProfile: (userId: number) => Promise<FullAlumniProfile>;
}

export const useAlumniStore = create<AlumniState>((set, get) => ({
  alumni: [],
  fullProfiles: {},
  isLoading: false,
  error: null,

  fetchAllAlumni: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await alumniApi.getAllAlumni();
      set({ alumni: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch alumni',
        isLoading: false,
      });
    }
  },

  fetchFullProfile: async (userId: number) => {
    const cached = get().fullProfiles[userId];
    if (cached) return cached;

    set({ isLoading: true, error: null });
    try {
      const response = await alumniApi.getAlumniProfile(userId);
      const profile = response.data.data;
      set((state) => ({
        fullProfiles: { ...state.fullProfiles, [userId]: profile },
        isLoading: false,
      }));
      return profile;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch profile',
        isLoading: false,
      });
      throw error;
    }
  },
}));
