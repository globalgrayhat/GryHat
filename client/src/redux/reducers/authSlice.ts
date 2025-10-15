import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import decodeJwtToken from "../../utils/decode";

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
let decodedToken = null;
try {
  decodedToken = accessToken ? decodeJwtToken(accessToken) : null;
} catch (error) {
  console.warn("Failed to decode token:", error);
}

const initialState = {
  data: {
    accessToken: accessToken,
    refreshToken,
  },
  isLoggedIn: accessToken ? true : false,
  userType: decodedToken?.payload?.role,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        userType: string;
      }>
    ) {
      localStorage.setItem(
        "accessToken",
        JSON.stringify({
          accessToken: action.payload.accessToken,
        })
      );
      localStorage.setItem(
        "refreshToken",
        JSON.stringify({
          refreshToken: action.payload.refreshToken,
        })
      );
      state.data = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
      state.isLoggedIn = true;
      state.userType = action.payload.userType;
    },
    clearToken(state) {
      state.data = {
        accessToken: "",
        refreshToken: "",
      };
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      state.isLoggedIn = false;
      state.userType = "";
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth.data;

export const selectAccessToken = (state: RootState) => {
  const accessTokenString: string | null = state.auth.data.accessToken;
  if (!accessTokenString) return "";
  try {
    const parsed = JSON.parse(accessTokenString);
    return parsed?.accessToken || accessTokenString; // Fallback to raw string if parsing fails
  } catch {
    return accessTokenString; // Return raw string if not JSON
  }
};
export const selectIsLoggedIn = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? true : false;
};

export const selectUserType = (state: RootState) => state.auth.userType;

export const authReducer = authSlice.reducer;
