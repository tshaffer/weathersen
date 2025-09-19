import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { DailyForecastDay, FetchAllForecastsResponse, FetchForecastResponse, Itinerary, ItineraryStop } from '../types';
import dayjs, { Dayjs } from 'dayjs';

export const fetchAllForecasts = createAsyncThunk(
  'forecast/fetchAllForecasts',
  async ({ date, locations: locationCoordinates, numberOfDays }: { date: string; locations: google.maps.LatLngLiteral[]; numberOfDays: number }) => {
    const response = await axios.get('/api/v1/allForecasts', {
      params: { date, locations: JSON.stringify(locationCoordinates), numberOfDays },
    });
    const fetchAllForecastsResponse: FetchAllForecastsResponse = response.data;
    return { forecastsForItineraryStops: fetchAllForecastsResponse.forecastsForItineraryStops };
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
  itineraryStart: dayjs().format("YYYY-MM-DD"),
  itineraryStops: [placeholderStop],
};

type DisplayDate = { year: number; month: number; day: number };

function toIsoString(d: DisplayDate): string {
  return dayjs(new Date(d.year, d.month - 1, d.day)).format("YYYY-MM-DD");
}

function matchesDisplayDate(dateStr: string, d: DisplayDate): boolean {
  return dateStr === toIsoString(d);
}

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setItineraryStartDate(state, action: PayloadAction<string>) {
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
    builder
      .addCase(fetchAllForecasts.fulfilled, (state, action: PayloadAction<any>) => {
        const fetchAllForecastsResponse: FetchAllForecastsResponse = action.payload;
        const { forecastsForItineraryStops } = fetchAllForecastsResponse;
        // debugger;
        // const numberOfItineraryStops = state.itineraryStops!.length;
        let itineraryStopIndex = 0;
        for (const forecastsForItineraryStop of forecastsForItineraryStops) {
          let forecastIndex = 0;
          for (const forecastForItineraryStop of forecastsForItineraryStop) {
            console.log('forecastForItineraryStop.displayDate:', forecastForItineraryStop.displayDate);
            const dateOfItineraryStop: string = dayjs(state.itineraryStart).add(itineraryStopIndex, "day").format("YYYY-MM-DD");
            console.log('dateOfItineraryStop:', dateOfItineraryStop);
            if (matchesDisplayDate(
              dateOfItineraryStop,
              forecastForItineraryStop.displayDate
            )) {
              const currentItineraryStop: ItineraryStop = state.itineraryStops![itineraryStopIndex];
              currentItineraryStop.forecast = forecastForItineraryStop;
              break;
            }
            forecastIndex++;
          }
          itineraryStopIndex++;
        }
      })
      .addCase(fetchForecast.fulfilled, (state, action: PayloadAction<any>) => {
        const fetchForecastResponse: FetchForecastResponse = action.payload;
        const { days: forecast, date, index } = fetchForecastResponse;

        for (const dailyForecast of forecast) {
          if (matchesDisplayDate(date, dailyForecast.displayDate)) {
            state.itineraryStops![index].forecast = dailyForecast;
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

