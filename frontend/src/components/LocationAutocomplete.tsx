// LocationAutocomplete.tsx
import { Box } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';

interface LocationAutocompleteProps {
  value: string;                                   // NEW
  onChangeText: (text: string) => void;            // NEW
  onSetMapLocation: (loc: google.maps.LatLngLiteral) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChangeText,
  onSetMapLocation,
}) => {
  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleMapLocationChanged = () => {
    if (!mapAutocompleteRef.current) return;
    const place: google.maps.places.PlaceResult = mapAutocompleteRef.current.getPlace();
    if (place?.geometry?.location) {
      const locationCoordinates: google.maps.LatLngLiteral = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      // Use the formatted address (or fallback to description) as the text value
      const text = place.formatted_address ?? place.name ?? '';
      onChangeText(text);                 // keep itinerary text in sync
      onSetMapLocation(locationCoordinates);   // let caller store lat/lng if desired
    } else {
      console.error('No place found in handleMapLocationChanged');
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Autocomplete
        onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
        onPlaceChanged={handleMapLocationChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter a location"
          value={value}                                     // controlled
          onChange={(e) => onChangeText(e.target.value)}    // controlled
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
      </Autocomplete>
    </Box>
  );
};

export default LocationAutocomplete;
