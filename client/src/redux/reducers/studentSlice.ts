import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { getStudentDetails } from "../../api/endpoints/student";
import type { ApiResponseStudent } from "../../api/types/apiResponses/api-response-student";
import decodeJwtToken from "../../utils/decode";

interface StudentData {
  studentDetails: ApiResponseStudent | null;
  studentId: string | null;
  isFetching: boolean;
  error: string | null;
}

const accessToken = localStorage.getItem("accessToken");
let decodedToken = null;
try {
  decodedToken = accessToken ? decodeJwtToken(accessToken) : null;
} catch (error) {
  console.warn("Error decoding JWT token in studentSlice:", error);
}

const initialState: StudentData = {
  studentDetails: null,
  studentId: decodedToken?.payload?.Id || null,
  isFetching: false,
  error: null,
};

// Async Thunk action creator to fetch user data
export const fetchStudentData = createAsyncThunk(
  "student/fetchStudentData",
  async () => {
    try {
      const response = await getStudentDetails();
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to fetch student data"
        );
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setDetails(state, action: PayloadAction<{ details: ApiResponseStudent }>) {
      state.studentDetails = action.payload.details;
    },
    clearDetails(state) {
      state.studentDetails = null;
      state.studentId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStudentData.pending, (state) => {
      state.isFetching = true;
      state.error = null;
    });
    builder.addCase(fetchStudentData.fulfilled, (state, action) => {
      state.isFetching = false;
      state.studentDetails = action.payload;
    });
    builder.addCase(fetchStudentData.rejected, (state, action) => {
      state.isFetching = false;
      state.error = action.error.message || "Failed to fetch student data";
    });
  },
});

export const { setDetails, clearDetails } = studentSlice.actions;

export const selectStudent = (state: RootState) => state.student;

export const selectStudentId = (state: RootState) =>
  state.student.studentDetails?._id;

export const selectIsFetchingStudent = (state: RootState) =>
  state.student.isFetching;

export const selectStudentError = (state: RootState) => state.student.error;

export const studentReducer = studentSlice.reducer;
