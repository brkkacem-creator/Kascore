import { create } from 'zustand';
import type { Match, Prediction, Profile } from '@/types';

interface KascoreStore {
  user: Profile | null;
  predictions: Record<string, Prediction>;
  liveMatches: Set<string>;

  setUser: (u: Profile | null) => void;
  setPrediction: (matchId: string, pred: Prediction) => void;
  setLiveMatch: (matchId: string, live: boolean) => void;
}

export const useKascoreStore = create<KascoreStore>((set) => ({
  user: null,
  predictions: {},
  liveMatches: new Set(),

  setUser: (u) => set({ user: u }),
  setPrediction: (matchId, pred) =>
    set((state) => ({ predictions: { ...state.predictions, [matchId]: pred } })),
  setLiveMatch: (matchId, live) =>
    set((state) => {
      const next = new Set(state.liveMatches);
      live ? next.add(matchId) : next.delete(matchId);
      return { liveMatches: next };
    }),
}));
