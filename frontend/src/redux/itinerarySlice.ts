import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { ItineraryState } from '../types';

// export const fetchProjects = createAsyncThunk(
//   'projects/fetchProjects',
//   async () => {
//     const response = await axios.get('/api/v1/projects');
//     return response.data.projectList;
//   }
// );

export const fetchForecast = createAsyncThunk(
  'forecast/fetchForecast',
  async ({ location, date }: { location: google.maps.LatLngLiteral; date: string }) => {
    const response = await axios.get('/api/v1/forecast', {
      params: { location: JSON.stringify(location), date },
    });
    return response.data;
  }
);

const initialState: ItineraryState = {
  itineraryStops: [],
};

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchForecast.fulfilled, (state, action: PayloadAction<any>) => {
      // Handle the fulfilled state of fetchForecast
      console.log('Forecast fetched:', action.payload);
      // You can update the state with the fetched forecast data if needed
    });
  },
});

export const {} = itinerarySlice.actions;

export default itinerarySlice.reducer;

