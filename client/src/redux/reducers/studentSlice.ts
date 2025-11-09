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

const initialState: StudentData = {
  studentDetails: null,
  studentId: decodedToken?.payload?.Id || null,
  isFetching: false,
  error: null,
};

export const fetchStudentData = createAsyncThunk(
  "student/fetchStudentData",
  async () => {
    const response = await getStudentDetails();
    return response?.data || response;
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setDetails(
      state,
      action: PayloadAction<{ studentDetails: ApiResponseStudent }>
    ) {
      state.studentDetails = action.payload.studentDetails;
      state.studentId = action.payload.studentDetails?._id || state.studentId;
    },
    clearDetails(state) {
      state.studentDetails = null;
      state.studentId = null;
      state.isFetching = false;
      state.error = null;
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
      state.studentId = action.payload?._id || state.studentId;
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
