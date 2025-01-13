import React, { useEffect, useRef, useState } from "react";

const GoogleAutocomplete = ({ onLocationSelect }) => {
  const inputRef = useRef(null);
  const [placeDetails, setPlaceDetails] = useState({
    placeId: "",
    coordinates: null,
    formattedAddress: "",
  });

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["place_id", "geometry", "formatted_address", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.geometry) {
          const selectedPlace = {
            placeId: place.place_id,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            formattedAddress: place.formatted_address,
            name: place.name
          };

          setPlaceDetails(selectedPlace);

          // Return the selected location details
          if (onLocationSelect) {
            onLocationSelect(selectedPlace);
          }
        }
      });
    };

    // Load Google Maps API script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws&libraries=places`;
      script.async = true;
      script.onload = initializeAutocomplete;
      document.body.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, [onLocationSelect]);

  return (
    <input
        ref={inputRef}
        type="text"
        placeholder="Enter a location"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
  );
};

export default GoogleAutocomplete;