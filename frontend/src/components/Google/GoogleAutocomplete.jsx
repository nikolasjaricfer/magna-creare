import React, { useState, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";


const GoogleAutocomplete = ({ onLocationSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address", "place_id"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      const ret = placeAutocomplete.getPlace();
      onLocationSelect({placeId: ret.place_id, coordinates: {lat: ret.geometry.location.lat(), lng: ret.geometry.location.lng()}, address: ret.formatted_address, name: ret.name});
    });
  }, [onLocationSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input ref={inputRef} />
    </div>
  );
};


export default GoogleAutocomplete;