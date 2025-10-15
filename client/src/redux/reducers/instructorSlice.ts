import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import decodeJwtToken from "../../utils/decode";
import type { InstructorApiResponse } from "../../api/types/apiResponses/api-response-instructors";

interface InstructorData {
  instructorDetails: InstructorApiResponse | null;
  instructorId: string | null;
}

const accessToken = localStorage.getItem("accessToken");
let decodedToken = null;
try {
  decodedToken = accessToken ? decodeJwtToken(accessToken) : null;
} catch (error) {
  console.warn("Error decoding JWT token in instructorSlice:", error);
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
