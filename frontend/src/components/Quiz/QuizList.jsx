import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import './quizListStyles.css';
import './quizStyles.css';
import api from '../../services/api';
import {
    APIProvider,
    ControlPosition,
    MapControl,
    AdvancedMarker,
    Map,
    useMap,
    useMapsLibrary,
    useAdvancedMarkerRef,
  } from "@vis.gl/react-google-maps";


const QuizList = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [showQuizPopup, setShowQuizPopup] = useState(false); // State for quiz creation popup
    const [showTeamPopup, setShowTeamPopup] = useState(false); // State for team application popup
    const [quizTitle, setQuizTitle] = useState('');
    const [location, setLocation] = useState('');
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
    const [teamName, setTeamName] = useState('');
    const [membersCount, setMembersCount] = useState('');
    const [quizIdToJoin, setQuizIdToJoin] = useState('');
    const [error, setError] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [appliedQuizzes, setAppliedQuizzes] = useState([]);
    const [activeQuizzes, setActiveQuizzes] = useState([]);
    const [archivedQuizzes, setArchivedQuizzes] = useState([]);

    const userRole = localStorage.getItem('role');
    const pageLocation = useLocation();

    if (!isAuthenticated) {
        localStorage.clear();
        logout();
        //return <Navigate to="/login" />;
    } 

        
    const handleNavigation = (path) => {
        if (!isAuthenticated) {
            navigate('/login'); // Redirect to login if not authenticated
        } else {
            navigate(path); // Navigate to the desired path if authenticated
        }
    };
    

    const PlaceAutocomplete = ({ onPlaceSelect }) => {
        const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
        const inputRef = useRef(null);
        const places = useMapsLibrary("places");
      
        useEffect(() => {
          if (!places || !inputRef.current) return;
      
          const options = {
            fields: ["geometry", "name", "formatted_address"],
          };
      
          setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
        }, [places]);
        useEffect(() => {
          if (!placeAutocomplete) return;
      
          placeAutocomplete.addListener("place_changed", () => {
            onPlaceSelect(placeAutocomplete.getPlace());
          });
        }, [onPlaceSelect, placeAutocomplete]);
        return (
            <input
            //type="text"
            id='quizInput'
            //placeholder="Location"
            required
            //value={location}
            ref={inputRef}
            />
        );
    };

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await api.get('/quizzes/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const now = new Date();
                const filteredQuizzes = response.data.filter(quiz => 
                    new Date(quiz.registration_deadline) >= now
                );

                console.log(filteredQuizzes);
                setQuizzes(filteredQuizzes); // Set quizzes state
            } catch (err) {
                setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
            }
        };

            // Load applied quizzes from localStorage
        const appliedQuizzesFromStorage = JSON.parse(localStorage.getItem('appliedQuizzes')) || [];
        setAppliedQuizzes(appliedQuizzesFromStorage); // Update state with applied quizzes


        fetchQuizzes();
    }, [token]);

    const handleQuizSubmission = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('api/quizzes/', {
                title: quizTitle,
                location: location,
                max_teams: maxTeams,
                description: description,
                category: category,
                difficulty: difficulty,
                registration_deadline: registration_deadline,
                fee: fee,
                duration: duration,
                organizer: localStorage.getItem('id'), // Backend assigns the organizer automatically
                is_league: false,
                prizes: prizes,
                start_time: startTime,
            });
            setQuizzes((prevQuizzes) => [...prevQuizzes, response.data]);
            setAllQuizzes((prevQuizzes) => [...prevQuizzes, response.data]);
            setShowAllQuizzes(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred');
        }
        setShowQuizPopup(false); // Close the popup after submission
    };

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
        }
    };



    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return; // Confirm action
    
        try {
            await api.delete(`/quizzes/${quizId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ažuriraj stanje kako bi se uklonio iz liste bez ponovnog učitavanja
            setAllQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
            setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));

        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while deleting the quiz.');

        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return; // Confirm action
    
        try {
            await api.delete(`/users/${userId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ažuriraj stanje kako bi se uklonio iz liste bez ponovnog učitavanja
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));


        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while deleting the quiz.');
            console.log(err);

        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return; // Confirm action
    
        try {
            await api.delete(`/teams/${teamId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ažuriraj stanje kako bi se uklonio iz liste bez ponovnog učitavanja
            setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));


        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while deleting the quiz.');
            console.log(err);

        }
    };
    

    return (
        <div>
            <div className='homeTop'>
                <h3 className='ime'>QUIZFINDER</h3>
                <div className="searchBar">
            <input
                type="text"
                placeholder="Search quizzes..."
                id="searchbar"
            />
                <div class="filterDropdown">
                    <button class="dropdownButton">Filter</button>
                        <div class="dropdownContent">
                            <div class="filterSection">
                                <h4>Težina</h4>
                                <label>Lagano <input type="checkbox" /></label>
                                <label>Srednje <input type="checkbox" /></label>
                                <label>Teško <input type="checkbox" /></label>
                            </div>
                                <div class="divider"></div> 
                            <div class="filterSection">
                                <h4>Tema</h4>
                                <label>Sport <input type="checkbox" /></label>
                                <label>Glazba <input type="checkbox" /></label>
                                <label>Opće <input type="checkbox" /></label>
                                <label>Drugo <input type="checkbox" /></label>
                            </div>
                            <div class="divider"></div>
                            <div class="filterSection">
                                <h4>Cijena</h4>
                                <label>manje od 5 <input type="checkbox" /></label>
                                <label>manje od 10 <input type="checkbox" /></label>
                                <label>manje od 15 <input type="checkbox" /></label>
                            </div>
                            <div class="divider"></div>
                            <div class="filterSection">
                                <h4>Liga</h4>
                                <label>Da <input type="checkbox" /></label>
                                <label>Ne <input type="checkbox" /></label>
                            </div>
                            <div class="divider"></div>
                            <div class="filterSection">
                                <h4>Udaljenost</h4>
                                <label>Najbliži <input type="checkbox" /></label>
                                <label>Najdalji <input type="checkbox" /></label>
                            </div>
                        </div>
                </div>


             


        </div>
                
                <button id='profileButton' onClick={() => handleNavigation('/Profile')}>
                    <img className='userImg' src={user_icon} alt='user_icon' />
                </button>
            </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!showQuizPopup & !showAllQuizzes  & !(viewReviews | viewTeams | viewUsers)&& 
        
            <div className='quizzes'>
                {quizzes.map((quiz) => (
                    <div className='kviz' key={quiz.id}>
                        <div className='nazivKviza'>{quiz.title}</div>
                        <div className='opisKviza'>
                            <p className='opis'>{quiz.description}</p>
                        </div>
                        <div className='informacije'>
                            <p>Kategorija: {quiz.category}</p>
                            <p>Težina: {quiz.difficulty}</p>
                            <p>Početak: {new Date(quiz.start_time).toLocaleString()}</p>
                            <p>Prijava do: {new Date(quiz.registration_deadline).toLocaleString()}</p>
                            
                        </div>
                        <div className='prijava'>
                        <button 
                            id='prijaviSe' 
                            onClick={() => {
                                handleNavigation('/quiz/');
                                setShowTeamPopup(true); // Open the team submission popup
                                setQuizIdToJoin(quiz.id); // Set the quiz ID for the team submission
                            }}
                        >
                            Prijavi se
                        </button>

                        </div>
                        
                    </div>
                ))}
            </div>
        }

        {!showQuizPopup & showAllQuizzes && 
        
            <div className='quizzes'>
                {allQuizzes.map((quiz) => (
                    <div className='kviz' key={quiz.id}>
                        <div className='nazivKviza'>{quiz.title}</div>
                        <div className='opisKviza'>
                            <p className='opis'>{quiz.description}</p>
                        </div>
                    <div className='informacije'>
                        <p>Kategorija: {quiz.category}</p>
                        <p>Težina: {quiz.difficulty}</p>
                        <p>Početak: {new Date(quiz.start_time).toLocaleString()}</p>
                        <p>Prijava do: {new Date(quiz.registration_deadline).toLocaleString()}</p>
                        
                    </div>
                    <div className='prijava'>
                        <button id='prijaviSe' onClick={() => handleDeleteQuiz(quiz.id)}>
                            Obriši
                        </button>
                    </div>
                    
                </div>
                ))}
            </div>
        }

        {!showQuizPopup & showAllQuizzes && 
        
            <div className='quizzes'>
                {allQuizzes.map((quiz) => (
                    <div className='kviz' key={quiz.id}>
                        <div className='nazivKviza'>{quiz.title}</div>
                        <div className='opisKviza'>
                            <p className='opis'>{quiz.description}</p>
                        </div>
                    <div className='informacije'>
                        <p>Kategorija: {quiz.category}</p>
                        <p>Težina: {quiz.difficulty}</p>
                        <p>Početak: {new Date(quiz.start_time).toLocaleString()}</p>
                        <p>Prijava do: {new Date(quiz.registration_deadline).toLocaleString()}</p>
                        
                    </div>
                    <div className='prijava'>
                        <button id='prijaviSe' onClick={() => handleDeleteQuiz(quiz.id)}>
                            Obriši
                        </button>
                    </div>
                    
                </div>
                ))}

            </div>
        }

        {!showQuizPopup & viewUsers && 
            <div className='quizzes'>
            {users.map((user) => (
                <div className='kviz' key={user.id}>
                    <div className='nazivKviza'>{user.username}</div>
                    <div className='opisKviza'>
                        <p className='opis'>{user.email}</p>
                    </div>
                <div className='informacije'>
                    <p> Role: {user.role}</p>
                    <p> Id: {user.id}</p>
                    
                </div>
                <div className='prijava'>
                    <button id='prijaviSe' onClick={() => handleDeleteUser(user.id)}>
                        Obriši
                    </button>
                </div>
                
            </div>
            ))}

        </div>}

        {!showQuizPopup & viewTeams && 
            <div className='quizzes'>
            {teams.map((team) => (
                <div className='kviz' key={team.id}>
                    <div className='nazivKviza'>{team.name}</div>
                    <div className='opisKviza'>
                        <p className='opis'>Clanovi: {team.members_count}</p>
                    </div>
                <div className='informacije'>
                    <p> Quiz: {team.quiz}</p>	
                </div>
                <div className='prijava'>
                    <button id='prijaviSe' onClick={() => handleDeleteTeam(team.id)}>
                        Obriši
                    </button>
                </div>
                
            </div>
            ))}

        </div>}

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
                                <option value="general-knowledge">General knowledge</option>
                                <option value="music">Music</option>
                                <option value="sports">Sports</option>
                                <option value="other">Other</option>
                            </select>

                            <APIProvider
                                apiKey={"AIzaSyCcuuQun2cil087pFWnlU7x4BxRiZPXQws"}
                                solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
                                >
                                <PlaceAutocomplete onPlaceSelect={setLocation} />
                            </APIProvider>

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

            {/* Team application popup */}
            {showTeamPopup && (
                <div className="popupOverlay">
                    <div className="popupContent">
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

            {/* Navigation */}
            <div className='navigacija'>
                <div className='buttons'>

                    <button id='navButtons' onClick={() => handleNavigation('/quiz')}> Home</button>
                    <button id='navButtons' onClick={() => handleNavigation('/archive')}> My archive</button>
                    <button id='navButtons' onClick={()=> {setShowAllQuizzes(false); setShowQuizPopup(false); setShowTeamPopup(false);setViewTeams(false);setViewReviews(false); setViewUsers(false)}}> Home</button>
                    <button id='navButtons'> My archive</button>
                    <button id='navButtons' onClick={() => navigate('/maps')}>Maps</button>
                    {userRole === 'quizmaker' | userRole === 'admin' && (
                        <button id="navButtons" onClick={() => setShowQuizPopup(true)}>
                            Add Quiz
                        </button>
                    )}

                    {userRole === 'admin' && (<p id='adminText'> Admin functions </p>)	}
                    {userRole === 'admin' && (
                        <button id='navButtons' onClick={() => {setShowAllQuizzes(true); setShowQuizPopup(false); setShowTeamPopup(false); setViewUsers(false);setViewTeams(false);setViewReviews(false); }}> Quizzes  </button>

                    )}

                    {userRole === 'admin' && (
                        <button id='navButtons' onClick={() => {setViewUsers(true); setShowQuizPopup(false); setShowTeamPopup(false); setShowAllQuizzes(false);setViewTeams(false);setViewReviews(false); }}> Users  </button>

                    )}

                    {userRole === 'admin' && (
                        <button id='navButtons' onClick={() => {setViewTeams(true); setShowQuizPopup(false); setShowTeamPopup(false); setViewUsers(false);setShowAllQuizzes(false);setViewReviews(false); }}> Teams  </button>

                    )}

                    {userRole === 'admin' && (
                        <button id='navButtons' onClick={() => {setViewReviews(true); setShowQuizPopup(false); setShowTeamPopup(false); setViewUsers(false);setViewTeams(false);setShowAllQuizzes(false); }}> Reviews  </button>

                    )}
                </div>
                <input class="locationInput" type="text" placeholder="Insert your location" />


                    <div className='contactButton'>
                    <button id='contacts' onClick={() => navigate('/contacts')}>
                        Developer contacts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizList;
