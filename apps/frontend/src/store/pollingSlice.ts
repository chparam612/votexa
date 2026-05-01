import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PollingStation } from '@votexa/algorithms';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface PollingState {
  recommendedStation: PollingStation | null;
  allStations: PollingStation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PollingState = {
  recommendedStation: null,
  allStations: [],
  isLoading: false,
  error: null,
};

export const fetchRecommendedStation = createAsyncThunk(
  'polling/fetchRecommended',
  async (_, { rejectWithValue }) => {
    try {
      const getRec = httpsCallable(functions, 'getRecommendedPollingStation');
      const result = await getRec();
      return result.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const pollingSlice = createSlice({
  name: 'polling',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedStation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecommendedStation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendedStation = action.payload.recommendedStation;
        state.allStations = action.payload.allStations;
      })
      .addCase(fetchRecommendedStation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export default pollingSlice.reducer;
