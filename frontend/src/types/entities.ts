import { DailyForecastDay } from "./googleInterfaces";

export interface ItineraryState {
  itineraryStops: ItineraryStop[];
}

export type Itinerary = ItineraryStop[];

export interface ItineraryStop {
  id: string; // unique identifier
  date: string; // ISO date string
  location: string; // e.g., "San Francisco, CA"
  locationCoordinates?: google.maps.LatLngLiteral;
  notes?: string; // optional notes for the stop
  forecast?: DailyForecastDay;
}

export interface FetchForecastResponse {
  days: DailyForecastDay[];
  date: string;
  index: number;
}
