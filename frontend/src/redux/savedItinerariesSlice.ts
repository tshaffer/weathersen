import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SavedItinerary, ItineraryStop } from '../types';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function stopsToSaved(stops: ItineraryStop[]) {
  return stops.map(s => ({
    stopId: s.id,
    placeName: s.placeName,
    location: s.location,
  }));
}

// ---- Thunks ----

export const fetchSavedItineraries = createAsyncThunk(
  'savedItineraries/fetch',
  async (token: string) => {
    const res = await axios.get('/api/v1/itineraries', { headers: authHeaders(token) });
    return res.data.itineraries as SavedItinerary[];
  }
);

export const saveNewItinerary = createAsyncThunk(
  'savedItineraries/create',
  async ({ name, itineraryStart, itineraryStops, token }: {
    name: string;
    itineraryStart: string;
    itineraryStops: ItineraryStop[];
    token: string;
  }) => {
    const res = await axios.post(
      '/api/v1/itineraries',
      { name, itineraryStart, itineraryStops: stopsToSaved(itineraryStops) },
      { headers: authHeaders(token) }
    );
    return res.data.itinerary as SavedItinerary;
  }
);

export const updateSavedItinerary = createAsyncThunk(
  'savedItineraries/update',
  async ({ id, name, itineraryStart, itineraryStops, token }: {
    id: string;
    name: string;
    itineraryStart: string;
    itineraryStops: ItineraryStop[];
    token: string;
  }) => {
    const res = await axios.put(
      `/api/v1/itineraries/${id}`,
      { name, itineraryStart, itineraryStops: stopsToSaved(itineraryStops) },
      { headers: authHeaders(token) }
    );
    return res.data.itinerary as SavedItinerary;
  }
);

export const removeSavedItinerary = createAsyncThunk(
  'savedItineraries/delete',
  async ({ id, token }: { id: string; token: string }) => {
    await axios.delete(`/api/v1/itineraries/${id}`, { headers: authHeaders(token) });
    return id;
  }
);

// ---- Slice ----

interface SavedItinerariesState {
  list: SavedItinerary[];
  error: string | null;
}

const initialState: SavedItinerariesState = { list: [], error: null };

const savedItinerariesSlice = createSlice({
  name: 'savedItineraries',
  initialState,
  reducers: {
    clearSavedItineraries(state) {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedItineraries.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(saveNewItinerary.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(saveNewItinerary.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to save itinerary';
      })
      .addCase(updateSavedItinerary.fulfilled, (state, action) => {
        const idx = state.list.findIndex(i => i._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeSavedItinerary.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(i => i._id !== action.payload);
      });
  },
});

export const { clearSavedItineraries } = savedItinerariesSlice.actions;
export default savedItinerariesSlice.reducer;
