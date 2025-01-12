import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import user_icon from './user_icon.png'
import './quizListStyles.css'
import './quizStyles.css'
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
    const [showAllQuizzes, setShowAllQuizzes] = useState(false);

    // For applying to a quiz
    const [teamName, setTeamName] = useState('');
    const [membersCount, setMembersCount] = useState('');
    const [quizIdToJoin, setQuizIdToJoin] = useState('');

    const [error, setError] = useState(null);

    const [quizzes, setQuizzes] = useState([]);
    const [allQuizzes, setAllQuizzes] = useState([]);

    const [users, setUsers] = useState([]);
    const [viewUsers, setViewUsers] = useState(false);

    const [teams, setTeams] = useState([]);
    const [viewTeams, setViewTeams] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [viewReviews, setViewReviews] = useState(false);

    const [filters, setFilters] = useState({
        difficulty: [],
        category: [],
        price: [],
        is_league: null,
        distance: null
    })

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

        /*
    function fetchQuizzes(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Filtered quizzes:", data.quizzes);
                // You can now update the frontend with the filtered quiz results
            })
            .catch(error => console.error("Error fetching quizzes:", error));
    }
            */

    
// Function to fetch quizzes based on filters
const fetchQuizzes = async () => {
    try {
        //const filters = getSelectedFilters(); // Get filters dynamically
        const url = buildSearchUrl(filters); // Construct URL with filters
        console.log(url);
        const response = await api.get(`api/search${url}`); // Fetch quizzes based on the URL
        console.log(url);
        console.log(JSON.stringify(response.data))

        setAllQuizzes(response.data.quizzes); // Set all quizzes to state

        // Filter quizzes based on the registration deadline
        const now = new Date();
        const filteredQuizzes = response.data.filter(
            (quiz) => new Date(quiz.registration_deadline) >= now
        );
        
        setQuizzes(filteredQuizzes); // Set filtered quizzes to state
        console.log(filteredQuizzes);
    } catch (err) {
        setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
    }
};

const fetchInitQuizzes = async ()=>{
    const response = await api.get('api/quizzes/');
    setAllQuizzes(response.data);
    console.log(JSON.stringify(response.data));
}

useEffect(() => {
    if (filters && (filters.category.length || filters.difficulty.length || filters.distance 
        || filters.is_league || filters.price.length)) { 
        fetchQuizzes(); // Call `fetchQuizzes` only when filters have values
    } else {
        fetchInitQuizzes();
    }
}, [filters]); // Run this effect when `filters` change


// useEffect to fetch quizzes when there are no filters
useEffect( () => {
    fetchInitQuizzes()
    
    //fetchQuizzes(); // Call the `fetchQuizzes` function
}, []); // Re-run whenever `filters` change

    

     // Update the filters when a checkbox is clicked
     const handleCheckboxChange = (event, filterType) => {
        const value = event.target.value;
        const checked = event.target.checked;

        setFilters(prevFilters => {
            // For difficulty, category, and price, it's an array
            if (filterType === 'difficulty' || filterType === 'category' || filterType === 'price') {
                return {
                    ...prevFilters,
                    [filterType]: checked
                        ? [...prevFilters[filterType], value]
                        : prevFilters[filterType].filter(item => item !== value)
                };
            }

            // For is_league and distance, they are single values (not arrays)
            if (filterType === 'is_league' || filterType === 'distance') {
                return {
                    ...prevFilters,
                    [filterType]: checked ? value : null
                };
            }

            return prevFilters;
        });
    };

    function buildSearchUrl(filters) {
        let url = "?"; // Assuming your API endpoint is "/api/search/"
        let params = [];
    
        if (filters.difficulty && filters.difficulty.length) {
            params.push("difficulty=" + filters.difficulty.join(","));
        }
        if (filters.category && filters.category.length) {
            params.push("category=" + filters.category.join(","));
        }
        if (filters.price && filters.price.length) {
            params.push("fee_max=" + Math.max(...filters.price));
        }
        if (filters.is_league) {
            params.push("is_league=" + filters.is_league);
        }
        if (filters.distance) {
            params.push("distance=" + filters.distance);
        }

        console.log(url);
        console.log(params);
        


    
        // Join parameters with "&" and append to the URL
        return params.length ? url + params.join("&") : url;
    }
    

    

    const userRole = localStorage.getItem('role');

    if(userRole === 'admin'){
        useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const response = await api.get('api/users/');
                    setUsers(response.data);

                    //console.log(users);

                } catch (err) {
                    setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
                }
            };

            const fetchTeams = async () => {
                try {
                    const response = await api.get('api/teams/');
                    setTeams(response.data);

                    //console.log(teams);

                } catch (err) {
                    setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
                }
            };

            const fetchReviews = async () => {
                try {
                    const response = await api.get('api/reviews/');
                    setReviews(response.data);

                    //console.log(reviews);

                } catch (err) {
                    setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
                }
            };
        
            fetchUsers(); // dohvacanje svih usera
            fetchTeams(); // dohvacanje svih timova
            fetchReviews(); // dohvacanje svih reviewa
        }, []);
    }

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
        
        console.log({
            name: teamName,
            quiz: quizIdToJoin,
            members_count: membersCount,
        });
        
        try {
            await api.post('api/teams/', {
                name: teamName,
                quiz: quizIdToJoin,
                members_count: membersCount
          
            });
    
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

<div className="filterDropdown">
                <button className="dropdownButton">Filter</button>
                <div className="dropdownContent">
                    <div className="filterSection">
                        <h4>Težina</h4>
                        <label>Lagano <input type="checkbox" className="difficulty" value="Easy"                             
                        onChange={e => handleCheckboxChange(e, 'difficulty')}/></label>
                        <label>Srednje <input type="checkbox" className="difficulty" value="Medium" 
                        onChange={e => handleCheckboxChange(e, 'difficulty')} /></label>
                        <label>Teško <input type="checkbox" className="difficulty" value="Hard" 
                        onChange={e => handleCheckboxChange(e, 'difficulty')}/></label>
                    </div>
                    <div className="divider"></div> 
                    <div className="filterSection">
                        <h4>Tema</h4>
                        <label>Sport <input type="checkbox" className="category" value="sports" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>Glazba <input type="checkbox" className="category" value="music" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>Opće <input type="checkbox" className="category" value="general" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>Drugo <input type="checkbox" className="category" value="other" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>Cijena</h4>
                        <label>manje od 5 <input type="checkbox" className="price" value="5" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                        <label>manje od 10 <input type="checkbox" className="price" value="10" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                        <label>manje od 15 <input type="checkbox" className="price" value="15" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>Liga</h4>
                        <label>Da <input type="checkbox" className="is_league" value="true" 
                        onChange={e => handleCheckboxChange(e, 'is_league')}/></label>
                        <label>Ne <input type="checkbox" className="is_league" value="false" 
                        onChange={e => handleCheckboxChange(e, 'is_league')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>Udaljenost</h4>
                        <label>Najbliži <input type="checkbox" className="distance" value="closest" 
                        onChange={e => handleCheckboxChange(e, 'distance')}/></label>
                        <label>Najdalji <input type="checkbox" className="distance" value="farthest" 
                        onChange={e => handleCheckboxChange(e, 'distance')}/></label>
                    </div>
                </div>
            </div>



             


        </div>
                
                <button id='profileButton' onClick={() => handleNavigation('/Profile')}>
                    <img className='userImg' src={user_icon} alt='user_icon' />
                </button>
            </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!showQuizPopup && !showAllQuizzes && !(viewReviews || viewTeams || viewUsers) && 
        
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

        {!showQuizPopup && showAllQuizzes && allQuizzes.length && 
        
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
        
{/*         
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
        } */}


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
                            <button type="button" id='quizButtons' onClick={() => setShowQuizPopup(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                            <button type="button" id="quizButtons" onClick={() => setShowTeamPopup(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className='navigacija'>
                <div className='buttons'>

                    <button id='navButtons' onClick={()=> {setShowAllQuizzes(false); setShowQuizPopup(false); setShowTeamPopup(false);setViewTeams(false);setViewReviews(false); setViewUsers(false)}}>Home</button>
                    <button id='navButtons' onClick={() => handleNavigation('/archive')}> My archive</button>
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
                <input className="locationInput" type="text" placeholder="Insert your location" />


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







