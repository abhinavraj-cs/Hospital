import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserBase, AuthTokens } from '@hospital-nav/shared-types';

interface AuthState {
  user: UserBase | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (user: UserBase, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<UserBase>) => void;
  getRoleDashboard: () => string;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      _hasHydrated: false,
      
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      
      login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      
      getRoleDashboard: () => {
        const { user } = get();
        if (!user) return '/';
        
        switch (user.role) {
          case 'SUPER_ADMIN':
          case 'ADMIN':
            return '/admin';
          case 'DOCTOR':
            return '/doctor';
          case 'STAFF':
            return '/staff';
          case 'PATIENT':
          default:
            return '/patient';
        }
      },
    }),
    {
      name: 'ArogyaMitra-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set isAuthenticated based on presence of user and tokens
        if (state) {
          const hasAuth = !!(state.user && state.tokens);
          state.isAuthenticated = hasAuth;
          state._hasHydrated = true;
        }
      },
    }
  )
);
