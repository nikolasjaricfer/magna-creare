//"use client";

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';


const PoiMarkers = (props) => {
  return (
    <>
      {props.pois.map(poi => (
        <AdvancedMarker
          key={poi.name}
          position={{ lat: poi.latitude, lng: poi.longitude  }}>
        <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}
    </>
  );
};



const MapsPage = () => {
  const [token, setToken] = useState('');
  const [locations, setLocations] = useState([]);
  const position = {lat: 45.8, lng: 16.0};


  useEffect(() => {
    const loadPins = async () => {
      setToken(localStorage.getItem('token'));
  
      const response = await api.get('api/locations/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setLocations(response.data);
      console.log(response.data);
    }

    loadPins();
  }, []);

  return (
    <APIProvider apiKey={"AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws"}>
      <Map
      mapId='DEMO_MAP_ID'
      style={{width: '100vw', height: '100vh'}}
      defaultCenter={position}
      defaultZoom={15}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      />
      <PoiMarkers pois={locations} />
    </APIProvider>
  );
}

export default MapsPage;