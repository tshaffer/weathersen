import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { FetchForecastResponse, GoogleGeometry, Itinerary, ItineraryStop } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import {  Location } from "../types";

// export const fetchAllForecasts = async (itineraryStart: Dayjs, itineraryStops: ItineraryStop[], dispatch: any) => {
//   for (let i = 0; i < itineraryStops.length; i++) {
//     const stop = itineraryStops[i];
//     if (stop.location && itineraryStart) {
//       const date = itineraryStart.add(i, 'day').format('YYYY-MM-DD');
//       const location: Location = stop.location!;
//       const geometry: GoogleGeometry = location.geometry!;
//       const googleLocation: google.maps.LatLngLiteral = geometry.location!;
//       dispatch(fetchForecast({ location: googleLocation, date, index: i }));
//     }
//   }
// };

export const fetchAllForecasts = createAsyncThunk(
  'forecast/fetchAllForecasts',
  async ({ date, locations: locationCoordinates, numberOfDays }: { date: string; locations: google.maps.LatLngLiteral[]; numberOfDays: number }) => {
    const response = await axios.get('/api/v1/allForecasts', {
      params: { date, location: JSON.stringify(locationCoordinates), numberOfDays },
    });
    return { days: response.data.days, date, locations: locationCoordinates };
  }
);

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
};

const initialState: Itinerary = {
  itineraryStart: dayjs(),
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
    setItineraryStartDate(state, action: PayloadAction<Dayjs>) {
      state.itineraryStart = action.payload;
    },
    setItineraryStops(state, action: PayloadAction<ItineraryStop[]>) {
      state.itineraryStops = action.payload;
    },
    clearItinerary(state) {
      state.itineraryStops = [placeholderStop];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchForecast.fulfilled, (state, action: PayloadAction<any>) => {
      const fetchForecastResponse: FetchForecastResponse = action.payload;
      const { days: forecast, date, index } = fetchForecastResponse;

      for (const dailyForecast of forecast) {
        if (matchesDisplayDate(action.payload.date, dailyForecast.displayDate)) {
          state.itineraryStops![action.payload.index].forecast = dailyForecast;
          break;
        }
      }
    });
  },
});

export const {
  setItineraryStartDate,
  setItineraryStops,
  clearItinerary
} = itinerarySlice.actions;

export default itinerarySlice.reducer;

