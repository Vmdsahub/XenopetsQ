import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import { supabaseAuthService } from '../services/supabaseAuthService';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

// Helper function to convert date strings back to Date objects
const rehydrateDates = (obj: any): any => {
  if (!obj) return obj;
  
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(rehydrateDates);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'createdAt' || key === 'lastLogin' || key === 'updatedAt') {
        result[key] = typeof value === 'string' ? new Date(value) : value;
      } else {
        result[key] = rehydrateDates(value);
      }
    }
    return result;
  }
  
  return obj;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          
          const user = await supabaseAuthService.getCurrentUser();
          if (user) {
            set({
              user,
              token: 'supabase-session',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await supabaseAuthService.login(credentials);
          
          if (response.success && response.user) {
            set({
              user: response.user,
              token: response.token || 'supabase-session',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.message || 'Login failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Login failed. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if username is "Vitoca" to make admin
          const modifiedCredentials = {
            ...credentials,
            username: credentials.username.toLowerCase() === 'vitoca' ? 'Vitoca' : credentials.username
          };

          const response = await supabaseAuthService.register(modifiedCredentials);
          
          if (response.success && response.user) {
            set({
              user: response.user,
              token: response.token || 'supabase-session',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.message || 'Registration failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Registration failed. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await supabaseAuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await supabaseAuthService.resetPassword(email);
          
          if (response.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({
              error: response.message || 'Password reset failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Password reset failed. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'xenopets-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.user = rehydrateDates(state.user);
        }
      }
    }
  )
);