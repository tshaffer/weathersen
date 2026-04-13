import { DailyForecastDay, Location } from "./googleInterfaces";

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthState {
  currentUser: User | null;
  token: string | null;
}

export interface Itinerary {
  itineraryStart: string; // ISO date string
  itineraryStops: ItineraryStop[];
  savedId?: string;   // _id of the saved DB record, if loaded from or saved to DB
  name?: string;      // name of the saved itinerary
}

export interface SavedStop {
  stopId: string;
  placeName?: string;
  location?: Location;
}

export interface SavedItinerary {
  _id: string;
  name: string;
  itineraryStart: string;
  itineraryStops: SavedStop[];
  updatedAt: string;
}

export interface ItineraryStop {
  id: string; // unique identifier
  placeName?: string;
  location?: Location;
  forecast?: DailyForecastDay;
}

export interface FetchAllForecastsResponse {
  forecastsForItineraryStops: DailyForecastDay[][];
}

export interface FetchForecastResponse {
  days: DailyForecastDay[];
  date: string;
  index: number;
}
