export interface ItineraryState {
  itineraryStops: ItineraryStop[] | null[] | undefined[];
}

export interface ItineraryStop {
  id: string; // unique identifier
  date: string; // ISO date string
  location: string; // e.g., "San Francisco, CA"
  notes?: string; // optional notes for the stop
}

interface Forecast {
  id: string;
  date: string;
  location: string;
  minTempC?: number;
  maxTempC?: number;
  precipChancePct?: number;
  windKph?: number;
  uvIndex?: number;
  cloudCoverPct?: number;
  sunrise?: string;
  sunset?: string;
  summary?: string;
}
