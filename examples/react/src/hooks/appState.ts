import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

export type AppState = {
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
};

export const useAppState = create<AppState>()(
  persist(
    set => ({
      userEmail: null,
      isLoggedIn: false,
      login: email => set({userEmail: email}),
      logout: () => set({userEmail: null}),
    }),
    {
      name: 'react-demo-app-state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
