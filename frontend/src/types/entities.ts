import { Dayjs } from "dayjs";
import { DailyForecastDay, Location } from "./googleInterfaces";

export interface Itinerary {
  itineraryStart: Dayjs;
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
