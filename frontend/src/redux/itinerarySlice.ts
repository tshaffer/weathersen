import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { ItineraryState } from '../types';

export const fetchForecast = createAsyncThunk(
  'forecast/fetchForecast',
  async ({ location, date, index }: { location: google.maps.LatLngLiteral; date: string; index: number }) => {
    const response = await axios.get('/api/v1/forecast', {
      params: { location: JSON.stringify(location), date },
    });
    return { days: response.data.days, date, index };
  }
);

const initialState: ItineraryState = {
  itineraryStops: [null, null, null, null, null, null, null, null, null, null],
};

type DisplayDate = { year: number; month: number; day: number };

function toIsoString(d: DisplayDate): string {
  const m = String(d.month).padStart(2, "0");
  const day = String(d.day).padStart(2, "0");
  return `${d.year}-${m}-${day}`;
}

function matchesDisplayDate(dateStr: string, d: DisplayDate): boolean {
  return dateStr === toIsoString(d);
}

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchForecast.fulfilled, (state, action: PayloadAction<any>) => {
      // Handle the fulfilled state of fetchForecast
      console.log('Forecast fetched:', action.payload);

      for (const day of action.payload.days) {
        if (matchesDisplayDate(action.payload.date, day.displayDate)) {
          state.itineraryStops![action.payload.index] = day;
          break;
        }
      }
    });
  },
});

export const {} = itinerarySlice.actions;

export default itinerarySlice.reducer;

