import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import api from '../../services/api';
import GoogleAutocomplete from '../Google/GoogleAutocomplete'; // Ensure you have this imported
import './MyArchiveStyles.css';

const MyArchive = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const navigate = useNavigate();
    const pageLocation = useLocation();

    const [archivedQuizzes, setArchivedQuizzes] = useState([]);
    const [error, setError] = useState(null);

    // Popup state
    const [showQuizPopup, setShowQuizPopup] = useState(false); // State for quiz creation popup
    const [showTeamPopup, setShowTeamPopup] = useState(false); // State for team application popup
    const [quizTitle, setQuizTitle] = useState('');
    const [maxTeams, setMaxTeams] = useState('');
    const [startTime, setStartTime] = useState('');
    const [registration_deadline, setRegistration_deadline] = useState('');
    const [fee, setFee] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [duration, setDuration] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [prizes, setPrizes] = useState('');
    const [appliedQuizzes, setAppliedQuizzes] = useState([]);
    const [activeQuizzes, setActiveQuizzes] = useState([]);
    const [showAllQuizzes, setShowAllQuizzes] = useState(false);
    const [locations, setLocations] = useState([]);
    const [locDict, setLocDict] = useState({});
    
        const [placeDetails, setPlaceDetails] = useState({
            placeId: "",        
            coordinates: null,
            formattedAddress: "",
            name: ""
        });

   

    async function handleQuizSubmission(e) {
        e.preventDefault();

        if (!Object.hasOwn(placeDetails, "placeId"))
            return;

        let locationBr = -1;

        try {
            const response = await api.get(`api/locations/by-place-id/?place_id=${placeDetails.placeId}`, {
                    name: placeDetails.name,
                    address: placeDetails.address,
                    latitude: placeDetails.coordinates.lat,
                    longitude: placeDetails.coordinates.lng,
                    place_id: placeDetails.placeId 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            console.log(response);
            if (response.data !== "Location does not exist") 
                locationBr = response.data.id;
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred');
        }


        if (locationBr == -1) {
            try {
                const response = await api.post('api/locations/', {
                        name: placeDetails.name,
                        address: placeDetails.address,
                        latitude: placeDetails.coordinates.lat,
                        longitude: placeDetails.coordinates.lng,
                        place_id: placeDetails.placeId 
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                locationBr = response.data.id;
            } catch (err) {
                setError(err.response?.data?.detail || 'An error occurred');
            }
        }

        try {
            const response = await api.post('api/quizzes/', {
                title: quizTitle,
                description: description,
                category: category,
                difficulty: difficulty,
                location: locationBr,
                max_teams: maxTeams,
                registration_deadline: registration_deadline,
                fee: fee,
                duration: duration,
                organizer: localStorage.getItem('id'),
                is_league: false,
                prizes: prizes,
                start_time: startTime,
                //created_at: startTime, //TODO stavi created_at na pravu vrijednost
                max_team_members: 5 //TODO stavi max_team_members na pravu vrijednost
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            setQuizzes((prevQuizzes) => [...prevQuizzes, response.data]);
            setAllQuizzes((prevQuizzes) => [...prevQuizzes, response.data]);
            setShowAllQuizzes(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred');
        }

        setShowQuizPopup(false); // Close the popup after submission
    };

    // Fetch archived quizzes on component mount
    useEffect(() => {
        const fetchArchivedQuizzes = async () => {
            try {
                const response = await api.get('api/quizzes/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setArchivedQuizzes(response.data.filter((quiz) => quiz.is_archived));
            } catch (err) {
                setError('Failed to fetch archived quizzes.');
            }
        };

        fetchArchivedQuizzes();
    }, [token]);

    return (
        <div>
            <div className="homeTop">
                <h3 className="ime">QUIZFINDER</h3>
                <button id="profileButton" onClick={() => navigate('/Profile')}>
                    <img className="userImg" src={user_icon} alt="user_icon" />
                </button>
                {userRole !== null && <p className="username">{localStorage.getItem('username')}</p>}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="quizzes">
                {archivedQuizzes.map((quiz) => (
                    <div className="arhivirani-kviz" key={quiz.id}>
                        <div className="nazivKviza">{quiz.title}</div>
                        <div className="opisKviza">
                            <p className="opis">{quiz.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {showQuizPopup && (
                <div className="popupOverlay">
                    <div className="popupContent">
                        <h3 id='addQuizText'>Add a New Quiz</h3>
                        <form onSubmit={handleQuizSubmission}>
                        <input
                                type="text"
                                id='quizInput'
                                placeholder="Quiz Title"
                                required
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                            />
                            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                <option value="">Select category</option>
                                <option value="general_knowledge">General knowledge</option>
                                <option value="music">Music</option>
                                <option value="sports">Sports</option>
                                <option value="other">Other</option>
                            </select>

                            <GoogleAutocomplete onLocationSelect={setPlaceDetails}/>

                            <input
                                type="number"
                                id='quizInput'
                                placeholder="Max Teams"
                                required
                                value={maxTeams}
                                onChange={(e) => setMaxTeams(e.target.value)}
                            />
                            <input
                                type="number"
                                id='quizInput'
                                placeholder="Fee"
                                required
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                            />
                            <p>Quiz start time</p>
                            <input
                                type="datetime-local"
                                id='quizInput'
                                placeholder="Start Time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <input
                                type="number"
                                id='quizInput'
                                placeholder="Duration"
                                required
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <p>Registration deadline</p>
                            <input
                                type="datetime-local"
                                id='quizInput'
                                placeholder="Registration deadline"
                                required
                                value={registration_deadline}
                                onChange={(e) => setRegistration_deadline(e.target.value)}
                            />
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                                <option value="">Select difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            <textarea
                                placeholder="Description"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                            <input
                                type="text"
                                id='quizInput'
                                placeholder="Prizes"
                                required
                                value={prizes}
                                onChange={(e) => setPrizes(e.target.value)}
                            />
                            <button type="submit" id='quizButtons'>Submit Quiz</button>
                            <button type="button" id='quizButtons' onClick={() => setShowQuizPopup(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}


            <div className="navigacija">
                <div className="buttons">
                    <button
                        id="navButtons"
                        className={pageLocation.pathname === '/quiz' ? 'active' : ''}
                        onClick={() => navigate('/quiz')}
                    >
                        Home
                    </button>
                    <button
                        id="navButtons"
                        className={pageLocation.pathname === '/my-archive' ? 'active' : ''}
                        onClick={() => navigate('/my-archive')}
                    >
                        My archive
                    </button>
                    <button
                        id="navButtons"
                        className={pageLocation.pathname === '/maps' ? 'active' : ''}
                        onClick={() => navigate('/maps')}
                    >
                        Maps
                    </button>
                    {userRole === 'quizmaker' || userRole === 'admin' ? (
                        <button id="navButtons" onClick={() => setShowQuizPopup(true)}>
                            Add Quiz
                        </button>
                    ) : null}
                </div>
                <div className="contactButton">
                    <button id="contacts" onClick={() => navigate('/contacts')}>
                        Developer contacts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyArchive;
