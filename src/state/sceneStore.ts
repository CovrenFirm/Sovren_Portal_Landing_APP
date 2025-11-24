import { create } from 'zustand';

export type ScenePhase = 'idle' | 'listening' | 'thinking' | 'responding';

interface SceneState {
  selectedExecutive: string | null;
  phase: ScenePhase;
  setSelectedExecutive: (executive: string | null) => void;
  setPhase: (phase: ScenePhase) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  selectedExecutive: 'CEO',
  phase: 'idle',
  setSelectedExecutive: (executive) => set({ selectedExecutive: executive }),
  setPhase: (phase) => set({ phase }),
}));
