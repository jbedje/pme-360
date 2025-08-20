import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, ProfileType } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: Date | null;
  refreshing: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest & { rememberMe?: boolean }) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  isSessionValid: () => boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_SESSION_EXPIRY'; payload: Date | null }
  | { type: 'SET_REFRESHING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  sessionExpiry: null,
  refreshing: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        refreshing: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionExpiry: null,
        refreshing: false,
      };
    case 'SET_SESSION_EXPIRY':
      return {
        ...state,
        sessionExpiry: action.payload,
      };
    case 'SET_REFRESHING':
      return {
        ...state,
        refreshing: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Session validation helper
  const isSessionValid = (): boolean => {
    if (!state.sessionExpiry) return false;
    return new Date() < state.sessionExpiry;
  };

  // Refresh session tokens
  const refreshSession = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.refreshToken(refreshToken);
      const { user, token, refreshToken: newRefreshToken, expiresIn } = response;

      // Store new tokens
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Calculate session expiry (subtract 5 minutes for safety)
      const expiryDate = new Date(Date.now() + (expiresIn * 1000) - (5 * 60 * 1000));
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiryDate });
      dispatch({ type: 'SET_REFRESHING', payload: false });
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');
        const storedExpiry = localStorage.getItem('session_expiry');

        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          const sessionExpiry = storedExpiry ? new Date(storedExpiry) : null;
          
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_SESSION_EXPIRY', payload: sessionExpiry });

          // Check if session needs refresh
          if (sessionExpiry && new Date() > new Date(sessionExpiry.getTime() - (10 * 60 * 1000))) {
            // Session expires in less than 10 minutes, refresh it
            await refreshSession();
          } else if (sessionExpiry && new Date() > sessionExpiry) {
            // Session already expired
            logout();
          } else {
            // Verify token with server periodically
            try {
              const freshUser = await apiService.getProfile();
              dispatch({ type: 'SET_USER', payload: freshUser });
              localStorage.setItem('user', JSON.stringify(freshUser));
            } catch (error) {
              // Token invalid, try to refresh
              await refreshSession();
            }
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!state.sessionExpiry || !state.isAuthenticated) return;

    const timeUntilRefresh = state.sessionExpiry.getTime() - Date.now() - (10 * 60 * 1000); // 10 minutes before expiry
    
    if (timeUntilRefresh > 0) {
      const refreshTimeout = setTimeout(() => {
        if (state.isAuthenticated && !state.refreshing) {
          refreshSession();
        }
      }, timeUntilRefresh);

      return () => clearTimeout(refreshTimeout);
    }
  }, [state.sessionExpiry, state.isAuthenticated, state.refreshing]);

  const login = async (credentials: LoginRequest & { rememberMe?: boolean }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const authData = await apiService.login(credentials);
      const { user, token, refreshToken, expiresIn } = authData;

      // Store tokens based on remember me preference
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('refresh_token', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Calculate session expiry
      const expiryDate = new Date(Date.now() + (expiresIn * 1000) - (5 * 60 * 1000));
      const storageType = credentials.rememberMe ? localStorage : sessionStorage;
      storageType.setItem('session_expiry', expiryDate.toISOString());

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiryDate });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const authData = await apiService.register(userData);
      const { user, token, refreshToken, expiresIn } = authData;

      // Store tokens (default to session storage for new registrations)
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));

      // Calculate session expiry
      const expiryDate = new Date(Date.now() + (expiresIn * 1000) - (5 * 60 * 1000));
      sessionStorage.setItem('session_expiry', expiryDate.toISOString());

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiryDate });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    // Clear all stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_expiry');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('session_expiry');

    apiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedUser = await apiService.updateProfile(userData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de mise à jour du profil';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshSession,
    isSessionValid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;