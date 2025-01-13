/*import React, { useEffect, useRef } from "react";

const LocationAutocomplete = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log("Selected Place:", place);
      });
    };

    // Initialize the Autocomplete after the Google API is loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws&libraries=places`;
      script.async = true;
      script.onload = initializeAutocomplete;
      document.body.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a location"
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />
    </div>
  );
};

export default LocationAutocomplete;
*/



import React, { useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places']; // Load the Places library

const LocationAutocomplete = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws',
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState(null);
  const [details, setDetails] = useState({
    coordinates: null,
    placeName: '',
    placeId: '',
  });

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location.lat();
      const lng = place.geometry?.location.lng();
      const name = place.name;
      const placeId = place.place_id;

      setDetails({
        coordinates: { lat, lng },
        placeName: name,
        placeId,
      });
      console.log(details);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder="Enter a location"
        style={{ width: '300px', padding: '10px' }}
      />
    </Autocomplete>
  );
};

export default LocationAutocomplete;
