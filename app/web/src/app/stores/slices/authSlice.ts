import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  scopeUserId: string;
}

interface AuthState {
  user: User | null;
  sessionResolved: boolean;
}

const initialState: AuthState = {
  user: null,
  sessionResolved: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSessionResolved: (state, action: PayloadAction<boolean>) => {
      state.sessionResolved = action.payload;
    },
    setSessionUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.sessionResolved = true;
    },
    logout: (state) => {
      state.user = null;
      state.sessionResolved = true;
    },
  },
});

export const { setUser, setSessionResolved, setSessionUser, logout } = authSlice.actions;
