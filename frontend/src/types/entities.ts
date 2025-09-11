export interface ItineraryState {
  itineraryStops: ItineraryStop[] | null[] | undefined[];
}

export interface ItineraryStop {
  id: string; // unique identifier
  date: string; // ISO date string
  location: string; // e.g., "San Francisco, CA"
  notes?: string; // optional notes for the stop
}

