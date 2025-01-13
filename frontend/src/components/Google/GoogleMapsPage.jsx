//"use client";

import React, { useState } from 'react';
import {APIProvider, Map} from "@vis.gl/react-google-maps";


export default function Maps() {
  const position = {lat: 45.8, lng: 16.0};

  return (
    <APIProvider apiKey="AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws">
      <Map
        style={{width: '100vw', height: '100vh'}}
        defaultCenter={position}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      />
    </APIProvider>
  );
}