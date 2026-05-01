import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { ProcessedNotification } from '@votexa/algorithms';

interface NotificationState {
  list: ProcessedNotification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  list: [],
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (limit: number, { rejectWithValue }) => {
    try {
      const process = httpsCallable(functions, 'processNotifications');
      const result = await process({ limit });
      return result.data.notifications;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export default notificationSlice.reducer;
