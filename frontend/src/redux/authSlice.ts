import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { AuthState, User } from '../types';

const TOKEN_KEY = 'weathersen_token';

function loadStoredAuth(): { token: string | null; currentUser: User | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem('weathersen_user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    return { token, currentUser };
  } catch {
    return { token: null, currentUser: null };
  }
}

const stored = loadStoredAuth();

const initialState: AuthState = {
  currentUser: stored.currentUser,
  token: stored.token,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ name, password }: { name: string; password: string }) => {
    const response = await axios.post('/api/v1/auth/login', { name, password });
    return response.data as { token: string; user: User };
  }
);

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (token: string) => {
    const response = await axios.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.users as User[];
  }
);

export const createUser = createAsyncThunk(
  'auth/createUser',
  async ({ name, email, password, token }: { name: string; email: string; password: string; token: string }) => {
    const response = await axios.post(
      '/api/v1/users',
      { name, email, password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.user as User;
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async ({ id, token }: { id: string; token: string }) => {
    await axios.delete(`/api/v1/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    users: [] as User[],
    error: null as string | null,
  },
  reducers: {
    logout(state) {
      state.currentUser = null;
      state.token = null;
      state.users = [];
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('weathersen_user');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
        state.error = null;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem('weathersen_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create user';
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
