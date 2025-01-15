import React, { useRef, useEffect, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES = ['places'];

function AutocompleteInput({funct}) {
  const autocompleteRef = useRef(null); 
  const [inputValue, setInputValue] = useState(''); 

  useEffect(() => {
    if (window.google && autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        fields: ['geometry', 'name', 'place_id', 'formatted_address'],
      });

      // Listener for when a place is selected
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (place) {
          funct({
            name: place.name || 'N/A',
            address: place.formatted_address || 'N/A',
            placeId: place.place_id,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          });

          setInputValue(place.formatted_address || '');
        }
      });
    }
  }, []);

  return (
    <input
      ref={autocompleteRef}
      type="text"
      value={inputValue}
      placeholder="Enter a location"
      onChange={(e) => setInputValue(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
  );
}

function GoogleAutocomplete({onLocationSelect}) {
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws"
      libraries={GOOGLE_MAPS_LIBRARIES}
    >
      <AutocompleteInput funct={onLocationSelect}/>
    </LoadScript>
  );
}

export default GoogleAutocomplete;