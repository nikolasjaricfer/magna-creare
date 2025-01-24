//"use client";
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

import api from '../../services/api';
import GoogleAutocomplete from './GoogleAutocomplete';
import {
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import './mapsStyles.css';

const MapsPage = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showTeamPopup, setShowTeamPopup] = useState(false); // State for team application popup
  const [quizMakerInfo, setQuizMakerInfo] = useState(null); // To store quizmaker info
  const [showQuizMakerPopup, setShowQuizMakerPopup] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [membersCount, setMembersCount] = useState('');
  const [quizIdToJoin, setQuizIdToJoin] = useState('');

  const [error, setError] = useState(null);
  
  const [appliedQuizzes, setAppliedQuizzes] = useState([]);

  const handleTeamSubmission = async (e) => {
    e.preventDefault();

    if (!teamName || !membersCount || !quizIdToJoin) {
        setError('Please fill in all fields correctly.');
        return;
    }

    try {
        await api.post('api/teams/', {
            name: teamName,
            quiz: quizIdToJoin,
            members_count: membersCount,
        });

        
        // Update applied quizzes in localStorage
        const appliedQuizzesFromStorage = JSON.parse(localStorage.getItem('appliedQuizzes')) || [];
        appliedQuizzesFromStorage.push(quizIdToJoin);
        localStorage.setItem('appliedQuizzes', JSON.stringify(appliedQuizzesFromStorage));

        setAppliedQuizzes(appliedQuizzesFromStorage); // Update state

        alert("You have successfully applied to the quiz!");
        setShowTeamPopup(false); // Close the team application popup on success
    } catch (err) {
        setError(err.response?.data?.detail || 'An error occurred');
        console.log(err)
    }
};

  const handleShowQuizMaker = async (organizerId) => {
    try {
        // Fetch quizmaker's general info
        const userResponse = await api.get(`/api/users/${organizerId}/`);
        const quizMakerInfo = userResponse.data;

        console.log("Response data: ", userResponse.data);

        // Fetch quizmaker's average score
        const scoreResponse = await api.get(`/api/users/${organizerId}/average-score/`);
        const averageScore = scoreResponse.data.average_score;
        console.log("Average score response: ", scoreResponse.data);


        // Combine both pieces of information
        setQuizMakerInfo({
            ...quizMakerInfo,
            averageRating: averageScore,
        });

        setShowQuizMakerPopup(true);
    } catch (err) {
        setError('Failed to fetch quizmaker info or average rating.');
    }
};

const handleClosePopup = () => {
  setShowQuizMakerPopup(false);
  setQuizMakerInfo(null);
};


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
  
      const response = await api.get('api/locations/active-only/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
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

    const d = 6378.0 * Math.acos(
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
      if(response.data[i].name == locationName ){
        id = response.data[i].id;
      }
    }
    const response2 = await api.get(`api/quizzes`);
    console.log(response2.data);
    const now = new Date();
    for(var i = 0; i < response2.data.length; i++){
      if(response2.data[i].location == id && new Date(response2.data[i].registration_deadline) >= now){
        kvizovi.push(response2.data[i]);
      }
    }
    setQuizzes(kvizovi);
  }

  return (
    <div className='maps'>

            {showQuizMakerPopup && quizMakerInfo && (
                <div
                    className="popupOverlayInfo"
                    onClick={handleClosePopup} // Close popup on clicking outside
                >
                    <div
                        className="popupContentInfo"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <h3>QuizMaker Info</h3>
                        <p><strong>Name:</strong> {quizMakerInfo.username}</p>
                        <p><strong>Email:</strong> {quizMakerInfo.email}</p>
                        <p>
                            <strong>Average Rating:</strong>{' '}
                            {quizMakerInfo.averageRating
                                ? `${quizMakerInfo.averageRating.toFixed(1)} / 5`
                                : 'No reviews yet'}
                        </p>
                        <button onClick={handleClosePopup}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showTeamPopup && (
                <div className="popupOverlayInfo">
                    <div className="popupContentInfo">
                        <h3 id='applyTeamText'>Apply to Join the Quiz</h3>
                        <form onSubmit={handleTeamSubmission}>
                            <input
                                type="text"
                                id="teamName"
                                placeholder="Team Name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                id="membersCount"
                                placeholder="Members Count"
                                value={membersCount}
                                onChange={(e) => setMembersCount(e.target.value)}
                                required
                            />
                            <button type="submit" id="quizButtons">Apply</button>
                            <button type="button" id="quizButtons" onClick={() => setShowTeamPopup(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

      <div className='filterDiv'>
        <button className="home-button" id='changeButton' onClick={() => navigate('/Quiz')}>
          Go to home page
        </button>
        <div className='lokacija'>
          <h3>My location:</h3>
          <GoogleAutocomplete onLocationSelect={(e) => {console.log(e); 
                                                        localStorage.setItem('myLat', e.coordinates.lat);
                                                        localStorage.setItem('myLng', e.coordinates.lng)}}/>
        </div>
        <div className='kvizovi'>
          <h3 className='distance'>My distance to selected location: {distance} km</h3>
          <h3 className='kvizoviText'>Quizzes on selected location:</h3>
          <div className='kvizoviList'>
          {quizzes.map((quiz) => (
                    <div className='kvizMap' key={quiz.id}>
                        <div className='nazivKviza'>{quiz.title}</div>
                        <div className='opisKviza'>
                            <p className='opis'>{quiz.description}</p>
                        </div>
                        <div className='informacije'>
                            <p><b>Category: </b> {quiz.category}</p>
                            <p><b>Difficulty: </b> {quiz.difficulty}</p>
                            <p><b>Start time: </b> {new Date(quiz.start_time).toLocaleString()}</p>
                            <p><b>Registration deadline: </b> {new Date(quiz.registration_deadline).toLocaleString()}</p>
                            <p><b>Duration: </b> {quiz.duration} mins</p>                         
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
                            disabled={appliedQuizzes.includes(quiz.id)} // Disable button if already applied
                        >
                            {appliedQuizzes.includes(quiz.id) ? 'Already Applied' : 'Sign Up'}
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