import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import decodeJwtToken from "../../utils/decode";
import type { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";

interface InstructorData {
  instructorDetails: InstructorApiResponse | null;
  instructorId: string | null;
}

const getStoredAccessToken = (): string => {
  if (typeof window === "undefined") return "";
  const raw = localStorage.getItem("accessToken");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.accessToken === "string"
      ? parsed.accessToken
      : raw;
  } catch {
    return raw;
  }
};

const bootstrapToken = getStoredAccessToken();
let decodedToken = null as ReturnType<typeof decodeJwtToken> | null;
if (bootstrapToken) {
  try {
    decodedToken = decodeJwtToken(bootstrapToken);
  } catch {
    decodedToken = null;
  }
}

const initialState: InstructorData = {
  instructorDetails: null,
  instructorId: decodedToken?.payload?.Id || null,
};

const instructorSlice = createSlice({
  name: "instructor",
  initialState,
  reducers: {
    setDetails(
      state,
      action: PayloadAction<{ details: InstructorApiResponse }>
    ) {
      state.instructorDetails = action.payload.details;
      state.instructorId = action.payload.details?._id || state.instructorId;
    },
    clearDetails(state) {
      state.instructorDetails = null;
      state.instructorId = null;
    },
  },
});

export const { setDetails, clearDetails } = instructorSlice.actions;

export const selectInstructor = (state: RootState) => state.instructor;

export const selectInstructorId = (state: RootState) =>
  state.instructor.instructorId;

export const instructorReducer = instructorSlice.reducer;
