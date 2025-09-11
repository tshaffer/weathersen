// GoogleMapsProvider.tsx
import * as React from 'react';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';

type Props = {
  children: React.ReactNode;
};

const libraries: Libraries = ['places'];

export default function GoogleMapsProvider({ children }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: '<my-google-maps-api-key>',
    libraries,
  });

  if (loadError) {
    // Render something that is still a ReactElement, not undefined
    return <></>;
  }

  // Only render children after the script is loaded; always return a ReactElement
  // return isLoaded ? <>{children}</> : <></>;
  return isLoaded ? <>{children}</> : <div>Loading maps…</div>;

}
