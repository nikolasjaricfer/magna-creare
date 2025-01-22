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

const MapsPage = () => {

  const PoiMarkers = (props) => {
    return (
      <>
        {props.pois.map(poi => (
          <AdvancedMarker
            key={poi.name}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            onClick={(e) => pinClick(poi)}
            >
          <Pin background={'#a44ad5'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker>
        ))}
      </>
    );
  };

  const [token, setToken] = useState('');
  const [locations, setLocations] = useState([]);
  const position = {lat: 45.8, lng: 16.0};

  const [quizzes, setQuizzes] = useState([]);
  const userRole = localStorage.getItem('role');
  var lat = 0;
  var lng = 0;


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
    }

    loadPins();
  }, []);

  var locationName = '';

  function calculateDistance(lat1, long1, lat2, long2) {

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    lat1 = toRadians(lat1);
    long1 = toRadians(long1);
    lat2 = toRadians(lat2);
    long2 = toRadians(long2);

    const d = 3963.0 * Math.acos(
        Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(long2 - long1)
    );

    return d.toFixed(2);
}

  const [distance, setDistance] = useState(0);
  //console.log(`Udaljenost: ${distance}`);


  const pinClick = async (pin) => {
    console.log(pin);
    lat = pin.latitude;
    lng = pin.longitude;
    setDistance(calculateDistance(localStorage.getItem('myLat'), localStorage.getItem('myLng'), lat, lng));
    locationName = pin.name;
    var kvizovi = []
    var id = 0;
    const url = '?q=' + pin.name;
    const response = await api.get(`api/locations`);
    for(var i = 0; i < response.data.length; i++){
      if(response.data[i].name == locationName){
        id = response.data[i].id;
      }
    }
    const response2 = await api.get(`api/quizzes`);
    for(var i = 0; i < response2.data.length; i++){
      if(response2.data[i].location == id){
        kvizovi.push(response2.data[i]);
      }
    }
    setQuizzes(kvizovi);
  }

  return (
    <div className='maps'>
      <div className='filterDiv'>
        <div className='lokacija'>
          <h3>My location:</h3>
          <GoogleAutocomplete onLocationSelect={(e) => {console.log(e); 
                                                        localStorage.setItem('myLat', e.coordinates.lat);
                                                        localStorage.setItem('myLng', e.coordinates.lng)}}/>
        </div>
        <div className='kvizovi'>
          <h3 className='distance'>My distance to selected location: {distance}</h3>
          <h3 className='kvizoviText'>Quizzes on selected location:</h3>
          <div className='kvizoviList'>
          {quizzes.map((quiz) => (
                    <div className='kviz' key={quiz.id}>
                        <div className='nazivKviza'>{quiz.title}</div>
                        <div className='opisKviza'>
                            <p className='opis'>{quiz.description}</p>
                        </div>
                        <div className='informacije'>
                            <p>Category: {quiz.category}</p>
                            <p>Difficulty: {quiz.difficulty}</p>
                            <p>Start time: {new Date(quiz.start_time).toLocaleString()}</p>
                            <p>Registration deadline: {new Date(quiz.registration_deadline).toLocaleString()}</p>
                            <p>Duration: {quiz.duration} mins</p>                         
                        </div>
                        {userRole !== 'admin' & userRole !==  null?
                        <div className='prijava'>
                        <button 
                            id='prijaviSe' 
                            onClick={() => {
                                if (!isAuthenticated) {
                                    alert('You need to log in to sign up for a quiz!');
                                    navigate('/login'); // Redirect to the login page
                                } else {
                                    setShowTeamPopup(true); // Open the team submission popup
                                    setQuizIdToJoin(quiz.id); // Set the quiz ID for the team submission
                                }
                            }}
                        >
                            {'Sign Up'}
                        </button>

                        <button
                            id='prijaviSe'
                            onClick={() => handleShowQuizMaker(quiz.organizer)}
                        >
                            Show QuizMaker Info
                        </button>


                        </div>:null}
                    </div>
                ))}

          </div>
        </div>
      </div>
      
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