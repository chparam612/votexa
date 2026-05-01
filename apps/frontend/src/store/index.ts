import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import electionReducer from './electionSlice';
import riskReducer from './riskSlice';
import pollingReducer from './pollingSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    election: electionReducer,
    risk: riskReducer,
    polling: pollingReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
