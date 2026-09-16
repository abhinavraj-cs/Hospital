import { create } from 'zustand';
import { UserBase, AuthTokens } from '@hospital-nav/shared-types';

interface AuthState {
  user: UserBase | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (user: UserBase, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
}));
