// LocationAutocomplete.tsx
import { Box } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';
import { Location } from '../types';

interface LocationAutocompleteProps {
  placeName: string;
  onSetPlaceName: (placeName: string) => void;
  onSetGoogleLocation: (googleLocation: Location) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = (props: LocationAutocompleteProps) => {

  const { placeName, onSetPlaceName, onSetGoogleLocation } = props;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  function pickGooglePlaceProperties(googlePlaceResult: google.maps.places.PlaceResult): Location {
    console.log('pickGooglePlaceProperties', googlePlaceResult);

    const googlePlace: Location = {
      googlePlaceId: googlePlaceResult.place_id!,
      name: googlePlaceResult.name!,
      geometry: {
        location: {
          lat: googlePlaceResult.geometry!.location!.lat(),
          lng: googlePlaceResult.geometry!.location!.lng()
        },
        viewport: {
          east: googlePlaceResult.geometry!.viewport!.getNorthEast().lng(),
          north: googlePlaceResult.geometry!.viewport!.getNorthEast().lat(),
          south: googlePlaceResult.geometry!.viewport!.getSouthWest().lat(),
          west: googlePlaceResult.geometry!.viewport!.getSouthWest().lng(),
        },
      },
    };
    return googlePlace;
  }

  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place: google.maps.places.PlaceResult = autocompleteRef.current.getPlace();
    if (place?.geometry?.location) {
      const googlePlace: Location = pickGooglePlaceProperties(place);
      onSetGoogleLocation(googlePlace!);
    } else {
      console.error('No place found in handleMapLocationChanged');
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          type="text"
          placeholder="Enter a location"
          value={placeName}                                     // controlled
          onChange={(e) => onSetPlaceName(e.target.value)}    // controlled
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
