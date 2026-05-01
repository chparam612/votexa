import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ElectionState, ElectionAction } from '@votexa/algorithms';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface ElectionStateSchema {
  currentState: ElectionState;
  stats: {
    registeredVoters: number;
    votesCast: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ElectionStateSchema = {
  currentState: ElectionState.SETUP,
  stats: {
    registeredVoters: 0,
    votesCast: 0,
  },
  isLoading: false,
  error: null,
};

// Async Thunk to fetch current dashboard state from Backend
export const fetchDashboard = createAsyncThunk(
  'election/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const getDashboard = httpsCallable(functions, 'getDashboard');
      const result = await getDashboard();
      return result.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk to request a state transition from Backend
export const requestTransition = createAsyncThunk(
  'election/requestTransition',
  async (action: ElectionAction, { rejectWithValue }) => {
    try {
      const transition = httpsCallable(functions, 'transitionElectionState');
      const result = await transition({ action });
      return result.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentState = action.payload.currentState;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request Transition
      .addCase(requestTransition.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestTransition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentState = action.payload.newState;
        state.error = null;
      })
      .addCase(requestTransition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = electionSlice.actions;
export default electionSlice.reducer;
