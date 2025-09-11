// GoogleMapsProvider.tsx
import * as React from 'react';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';

const libraries: Libraries = ['places'];

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const googleMapsApiKey =
    (window as any).__ENV__?.GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey,
    libraries,
  });

  if (loadError) return <></>;
  return isLoaded ? <>{children}</> : <div>Loading maps…</div>;
}
