import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { FetchForecastResponse, ItineraryState, ItineraryStop } from '../types';
import { current } from 'immer';

export const fetchForecast = createAsyncThunk(
  'forecast/fetchForecast',
  async ({ location: locationCoordinates, date, index }: { location: google.maps.LatLngLiteral; date: string; index: number }) => {
    const response = await axios.get('/api/v1/forecast', {
      params: { location: JSON.stringify(locationCoordinates), date },
    });
    return { days: response.data.days, date, index };
  }
);

const placeholderStop: ItineraryStop = {
  id: crypto.randomUUID(),
  date: new Date().toISOString().slice(0, 10),
  location: '',
};

const initialState: ItineraryState = {
  itineraryStops: [placeholderStop],
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
    setItinerary(state, action: PayloadAction<ItineraryStop[]>) {
      state.itineraryStops = action.payload;
    },
    clearItinerary(state) {
      state.itineraryStops = [placeholderStop];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchForecast.fulfilled, (state, action: PayloadAction<any>) => {

      console.log('Forecast fetched:', action.payload);

      const fetchForecastResponse: FetchForecastResponse = action.payload;
      const { days: forecast, date, index } = fetchForecastResponse;

      for (const dailyForecast of forecast) {
        if (matchesDisplayDate(action.payload.date, dailyForecast.displayDate)) {
          console.log('Plain object before:', current(state.itineraryStops[index]));
          state.itineraryStops![action.payload.index].forecast = dailyForecast;
          console.log('Plain object after:', current(state.itineraryStops[index]));
          break;
        }
      }
    });
  },
});

export const {
  setItinerary,
  clearItinerary
} = itinerarySlice.actions;

export default itinerarySlice.reducer;

