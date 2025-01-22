//"use client";

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import GoogleAutocomplete from './GoogleAutocomplete';
import {
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import './mapsStyles.css';


const PoiMarkers = (props) => {
  return (
    <>
      {props.pois.map(poi => (
        <AdvancedMarker
          key={poi.name}
          position={{ lat: poi.latitude, lng: poi.longitude }}>
        <Pin background={'#a44ad5'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

const MapsPage = () => {
  const [token, setToken] = useState('');
  const [locations, setLocations] = useState([]);
  const position = {lat: 45.8, lng: 16.0};

  const [quizzes, setQuizzes] = useState([]);


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

    <div className='maps'>
      <GoogleAutocomplete onLocationSelect={console.log}/>
      <Map
      mapId='Quiz_Maker_Map'
      style={{width: '100vw', height: '100vh'}}
      defaultCenter={position}
      defaultZoom={15}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      />
      <PoiMarkers pois={locations} />
    </div>
  );
}

export default MapsPage;