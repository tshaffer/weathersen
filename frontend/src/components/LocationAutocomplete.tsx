import { Box } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';

interface LocationAutocompleteProps {
  onSetMapLocation: (mapLocation: google.maps.LatLngLiteral) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSetMapLocation,
}) => {

  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleMapLocationChanged = () => {
    if (mapAutocompleteRef.current) {
      const place = mapAutocompleteRef.current.getPlace();
      if (place?.geometry?.location && place.formatted_address) {
        const newCoordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onSetMapLocation(newCoordinates);
      } else {
        console.error('No place found in handleMapLocationChanged');
      }
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
}

export default LocationAutocomplete;
