import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RiskLevel } from '@votexa/algorithms';
import { functions } from '../firebase';

interface RiskState {
  currentRisk: {
    score: number;
    level: RiskLevel;
    flags: string[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RiskState = {
  currentRisk: null,
  isLoading: false,
  error: null,
};

export const fetchRiskReport = createAsyncThunk(
  'risk/fetchReport',
  async (voteId: string, { rejectWithValue }) => {
    try {
      const getRiskReport = functions.httpsCallable('getRiskReport');
      const result = await getRiskReport({ voteId });
      return result.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiskReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRiskReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRisk = action.payload;
      })
      .addCase(fetchRiskReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export default riskSlice.reducer;
