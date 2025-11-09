/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserType = "student" | "instructor" | "admin" | null;

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userType: UserType;
  userId: string | null;
  email: string | null;
  isLoggedIn: boolean;
}

const STORAGE_KEY = "gh_auth";

interface StoredAuth {
  accessToken: string | null;
  refreshToken: string | null;
  userType: UserType;
  userId: string | null;
  email: string | null;
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(base64), (c: string) =>
          "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
  }
  return "";
}

function decodeJwt(token: string | null): {
  userId: string | null;
  email: string | null;
  role: UserType;
  exp: number | null;
} {
  if (!token) return { userId: null, email: null, role: null, exp: null };
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return { userId: null, email: null, role: null, exp: null };
    }
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    const inner = payload.payload || payload;
    const userId = inner.Id || inner.id || null;
    const email = inner.email || null;
    const role = (inner.role as UserType) || null;
    const exp = typeof payload.exp === "number" ? payload.exp : null;

    return { userId, email, role, exp };
  } catch {
    return { userId: null, email: null, role: null, exp: null };
  }
}

function isExpired(exp: number | null): boolean {
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

function loadInitialState(): AuthState {
  const stored = safeParse<StoredAuth>(localStorage.getItem(STORAGE_KEY));
  if (!stored || !stored.accessToken) {
    return {
      accessToken: null,
      refreshToken: null,
      userType: null,
      userId: null,
      email: null,
      isLoggedIn: false,
    };
  }

  const decoded = decodeJwt(stored.accessToken);
  if (isExpired(decoded.exp)) {
    localStorage.removeItem(STORAGE_KEY);
    return {
      accessToken: null,
      refreshToken: null,
      userType: null,
      userId: null,
      email: null,
      isLoggedIn: false,
    };
  }

  return {
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    userType: stored.userType || decoded.role,
    userId: stored.userId || decoded.userId,
    email: stored.email || decoded.email,
    isLoggedIn: true,
  };
}

const initialState: AuthState = loadInitialState();

interface SetTokenPayload {
  accessToken: string;
  refreshToken?: string;
  userType?: UserType;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<SetTokenPayload>) => {
      const { accessToken, refreshToken, userType } = action.payload;
      const decoded = decodeJwt(accessToken);

      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? state.refreshToken;
      state.userType = userType || decoded.role;
      state.userId = decoded.userId;
      state.email = decoded.email;
      state.isLoggedIn = true;

      const toStore: StoredAuth = {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userType: state.userType,
        userId: state.userId,
        email: state.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userType = null;
      state.userId = null;
      state.email = null;
      state.isLoggedIn = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setToken, clearAuth: clearToken } = authSlice.actions;

export const selectAccessToken = (state: any): string | null =>
  state.auth?.accessToken ?? null;
export const selectRefreshToken = (state: any): string | null =>
  state.auth?.refreshToken ?? null;
export const selectUserType = (state: any): UserType =>
  state.auth?.userType ?? null;
export const selectUserId = (state: any): string | null =>
  state.auth?.userId ?? null;
export const selectIsLoggedIn = (state: any): boolean =>
  Boolean(state.auth?.isLoggedIn && state.auth?.accessToken);

export default authSlice.reducer;
