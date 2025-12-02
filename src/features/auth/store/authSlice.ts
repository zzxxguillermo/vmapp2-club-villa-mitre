import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Usuario,
  AuthState,
} from '../../../types';
import { authService } from '../services/authService';


// Async thunks
// Async thunks
// login, register, logout moved to TanStack Query mutations

export const getCurrentUser = createAsyncThunk<Usuario>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getUserData();
      if (!userData) {
        return rejectWithValue('No se pudo obtener datos del usuario');
      }
      return userData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al obtener usuario');
    }
  }
);

export const checkAuthStatus = createAsyncThunk<boolean>(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      return isAuthenticated;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al verificar autenticación'
      );
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper interface for auth response
interface AuthResponse {
  token: string;
  user: Usuario;
  fetched_from_api: boolean;
  refreshed: boolean;
}

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<Usuario>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearSession: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
    builder
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload;
        if (!action.payload) {
          state.user = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, setUser, clearSession } = authSlice.actions;
export default authSlice.reducer;
