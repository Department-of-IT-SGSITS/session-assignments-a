import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import type { LocationSettings } from '@/types';
import { Skeleton } from './ui/skeleton';

interface MapPickerProps {
    onLocationSelect: (location: LocationSettings) => void;
    current_lat?: number;
    current_lon?: number;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: 'var(--radius)',
};

const MapPicker = ({ onLocationSelect, current_lat, current_lon }: MapPickerProps) => {
  const [marker, setMarker] = useState({ lat: current_lat || 23.2599, lng: current_lon || 77.4126 });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarker({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
            const address = results[0].formatted_address;
            const cityComponent = results[0].address_components.find(c => c.types.includes('locality'));
            const city = cityComponent ? cityComponent.long_name : '';
            
            onLocationSelect({ lat: lat, lon: lng, displayName: address, city: city });
        } else {
            onLocationSelect({ lat: lat, lon: lng, displayName: `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}` });
        }
      });
    }
  }, [onLocationSelect]);

  if (loadError) {
    return <div>Error loading maps. Please ensure you have a valid Google Maps API key.</div>;
  }
  
  if (!isLoaded) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker}
        zoom={10}
        onClick={onMapClick}
      >
        <MarkerF position={marker} />
      </GoogleMap>
  );
};

export default MapPicker;
