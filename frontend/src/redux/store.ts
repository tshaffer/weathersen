import { configureStore } from '@reduxjs/toolkit';
import itineraryReducer from './itinerarySlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    itinerary: itineraryReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
