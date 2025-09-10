import React from 'react';
import ItineraryInput, { Itinerary } from './ItineraryInput';

export default function WeathersenPage() {
  const [itinerary, setItinerary] = React.useState<Itinerary>([]);
  return (
    <div style={{ padding: 16 }}>
      <ItineraryInput
        value={itinerary}
        onChange={setItinerary}
        onClear={() => setItinerary([])}
      />
      {/* Later: pass `itinerary` into your forecast table component */}
    </div>
  );
}
