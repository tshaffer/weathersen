// LocationAutocomplete.tsx
import { Box } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { useEffect, useRef } from 'react';
import { Location } from '../types';

interface LocationAutocompleteProps {
  placeName: string;
  onSetPlaceName: (placeName: string) => void;         // we'll set this to the exact dropdown label
  onSetGoogleLocation: (googleLocation: Location, placeName: string) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = (props) => {
  const { placeName, onSetPlaceName, onSetGoogleLocation } = props;

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // NEW: refs for predictions cache + services
  const predictionsByIdRef = useRef<Map<string, google.maps.places.AutocompletePrediction>>(
    new Map()
  );
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (!('google' in window)) return;
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    }
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  function buildLocation(googlePlaceResult: google.maps.places.PlaceResult): Location {
    const location: Location = {
      googlePlaceId: googlePlaceResult.place_id!,
      name: googlePlaceResult.name!,
      geometry: {
        location: {
          lat: googlePlaceResult.geometry!.location!.lat(),
          lng: googlePlaceResult.geometry!.location!.lng(),
        },
      },
    };
    return location;
  }

  // UPDATED: track keystrokes to fetch predictions and cache the exact labels
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSetPlaceName(val); // keep your controlled input in sync

    if (!autocompleteServiceRef.current) return;

    const request: google.maps.places.AutocompletionRequest = {
      input: val,
      sessionToken: sessionTokenRef.current ?? undefined,
      // You can add: componentRestrictions: { country: ['us'] }, types: ['geocode']
    };

    autocompleteServiceRef.current.getPlacePredictions(request, (predictions) => {
      predictionsByIdRef.current.clear();
      (predictions ?? []).forEach((p) => {
        predictionsByIdRef.current.set(p.place_id, p);
      });
    });
  };

  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace() as google.maps.places.PlaceResult | undefined;
    if (!place) return;
    
    // Prefer the *exact* label the user saw in the dropdown
    const matchedPrediction = place.place_id
      ? predictionsByIdRef.current.get(place.place_id)
      : undefined;

      let placeName: string = '';

    // If we found it, set your controlled field to the exact dropdown label.
    if (matchedPrediction?.description) {
      placeName = matchedPrediction.description;
    } else {
      // Fallback: use PlaceResult fields if prediction cache missed
      const fallback: string =
        place.formatted_address ??
        [place.name, place.vicinity].filter(Boolean).join(', ') ??
        placeName;
      placeName = fallback;
    }

    if (place.geometry?.location) {
      const googlePlace: Location = buildLocation(place);
      onSetGoogleLocation(googlePlace, placeName);
    } else {
      console.error('No place geometry found in handlePlaceChanged');
    }

    // Start a new session after a successful selection (best practice)
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
        // Request only the fields you need to reduce quota/latency.
        options={{
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'vicinity'],
          // componentRestrictions: { country: ['us'] },
          // types: ['geocode'],
        }}
      >
        <input
          type="text"
          placeholder="Enter a location"
          value={placeName}                     // controlled
          onChange={handleInputChange}          // UPDATED
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
