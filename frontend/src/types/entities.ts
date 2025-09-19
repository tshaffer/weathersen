import { DailyForecastDay, Location } from "./googleInterfaces";

export interface Itinerary {
  itineraryStart: string; // ISO date string
  itineraryStops: ItineraryStop[];
}

export interface ItineraryStop {
  id: string; // unique identifier
  // date: string; // ISO date string
  placeName?: string;
  location?: Location;
  forecast?: DailyForecastDay;
}

export interface FetchForecastResponse {
  days: DailyForecastDay[];
  date: string;
  index: number;
}
