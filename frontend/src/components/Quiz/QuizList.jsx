import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import './quizListStyles.css';
import './quizStyles.css';
import api from '../../services/api';
import GoogleAutocomplete from '../Google/GoogleAutocomplete';

const QuizList = () => {
    var token = localStorage.getItem('token');

    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);
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
    const [archivedQuizzes, setArchivedQuizzes] = useState([]);
    const [showAllQuizzes, setShowAllQuizzes] = useState(false);

    const [placeDetails, setPlaceDetails] = useState({
        placeId: "",        
        coordinates: null,
        formattedAddress: "",
        name: ""
    });

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

    const userRole = localStorage.getItem('role');
    const pageLocation = useLocation();

    const [quizMakerInfo, setQuizMakerInfo] = useState(null); // To store quizmaker info
    const [showQuizMakerPopup, setShowQuizMakerPopup] = useState(false);

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
    

    // Close the popup
    const handleClosePopup = () => {
        setShowQuizMakerPopup(false);
        setQuizMakerInfo(null);
    };


    const [filters, setFilters] = useState({
        difficulty: [],
        category: [],
        price: [],
        is_league: null,
        distance: null,
        q: null
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

    useEffect(() => {
        const appliedQuizzesFromStorage = JSON.parse(localStorage.getItem('appliedQuizzes')) || [];
        setAppliedQuizzes(appliedQuizzesFromStorage);
    }, []); // Run only once on component mount
    

    
// Function to fetch quizzes based on filters
const fetchQuizzes = async () => {
    try {
        //const filters = getSelectedFilters(); // Get filters dynamically
        const url = buildSearchUrl(filters); // Construct URL with filters
        //console.log(url);
        const response = await api.get(`api/search${url}`); // Fetch quizzes based on the URL
        
        //console.log(url);
        //console.log(JSON.stringify(response.data))

        setQuizzes(response.data.quizzes); // Set all quizzes to state

        // Filter quizzes based on the registration deadline
        const now = new Date();
        const filteredQuizzes = response.data.filter(
            (quiz) => new Date(quiz.registration_deadline) >= now
        );
        
        setQuizzes(filteredQuizzes); // Set filtered quizzes to state
        const appliedQuizzesFromStorage = JSON.parse(localStorage.getItem('appliedQuizzes')) || [];
        setAppliedQuizzes(appliedQuizzesFromStorage); // Update state with applied quizzes
        //console.log(filteredQuizzes);
    } catch (err) {
        setError(err.response?.data?.detail || 'An error occurred while fetching quizzes.');
    }
};

const fetchInitQuizzes = async ()=>{
    const response = await api.get('api/quizzes/');
    setAllQuizzes(response.data);
   // console.log(response.data);
    const now = new Date();
    setQuizzes(response.data.filter((quiz) => new Date(quiz.registration_deadline) >= now));
    console.log((response.data));
    console.log("Filtirani kvizovi: " + quizzes);
}

useEffect(() => {
    if (filters && (filters.category.length || filters.difficulty.length || filters.distance 
        || filters.is_league || filters.price.length || filters.q)) { 
        fetchQuizzes(); // Call `fetchQuizzes` only when filters have values
    } else {
        fetchInitQuizzes();
    }
}, [filters]); // Run this effect when `filters` change


// useEffect to fetch quizzes when there are no filters
useEffect( () => {
    fetchInitQuizzes()
    
    //fetchQuizzes(); // Call the `fetchQuizzes` function
}, []); 

    

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
        if (filters.q) {
            params.push("q=" + filters.q);
        }

        console.log(url);
        console.log(params);
        
        // Join parameters with "&" and append to the URL
        return params.length ? url + params.join("&") : url;
    }
    
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

   
    /*

    const fetchQuizzes2 = async () => {
        try {
            const params = new URLSearchParams(filters2).toString(); // Convert filters2 to query params
            const url = buildSearchUrl(filters2);
            console.log(url);
            console.log(params);
            
            //const response = await api.get(`api/search?${url}`); // Send GET request with query params
            const response = await api.get(`api/search?${url}`); // Send GET request with query params

            setAllQuizzes(response.data.quizzes); // Update the state with the response data

        } catch (error) {
            console.error("Failed to fetch quizzes:", error); // Log errors for debugging
        }
    };
    */

   

    

    // Function to handle search input
    const handleSearch = (query) => {
    // Update the `q` field in the `filters` state
    setFilters((prevFilters) => ({
        ...prevFilters, // Keep other filters unchanged
        q: query, // Update the search query
    }));
};

    const handleQuizSubmission = async (e) => {
        e.preventDefault();
        token = localStorage.getItem('token');

        try {
            await api.post('api/locations/', {
                name: placeDetails.name,
                address: placeDetails.formattedAddress,
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
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred');
        }

        try {
            const response = await api.post('api/quizzes/', {
                title: quizTitle,
                description: description,
                category: category,
                difficulty: difficulty,
                location: 1, //TODO dadati lokaciju
                max_teams: maxTeams,
                registration_deadline: registration_deadline,
                fee: fee,
                duration: duration,
                organizer: localStorage.getItem('id'),
                is_league: false,
                prizes: prizes,
                start_time: startTime,
                created_at: startTime, //TODO stavi created_at na pravu vrijednost
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
            await api.delete(`/api/quizzes/${quizId}/`, {
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
            await api.delete(`/api/users/${userId}/`, {
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
            await api.delete(`/api/teams/${teamId}/`, {
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

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return; // Confirm action
    
        try {
            await api.delete(`/api/reviews/${reviewId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ažuriraj stanje kako bi se uklonio iz liste bez ponovnog učitavanja
            setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));


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
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { // Check if the "Enter" key is pressed
                            const query = e.target.value.trim(); // Get the search query and trim whitespace
                            handleSearch(query); // Call the handleSearch function
                            console.log(query); // Log the query for debugging
                        }
                    }}
                />


        
        </div>
                
                <button id='profileButton' onClick={() => handleNavigation('/Profile')}>
                {userRole === null ? "Register" : <img className='userImg' src={user_icon} alt='user_icon' />}
                </button>
            </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!showQuizPopup && !showAllQuizzes && !(viewReviews || viewTeams || viewUsers) && !showTeamPopup &&
        
            <div className='quizzes'>
                <div className="filterDropdown">
                <button className="dropdownButton">Filter</button>
                <div className="dropdownContent">
                    <div className="filterSection">
                        <h4>Difficulty</h4>
                        <label>Easy <input type="checkbox" className="difficulty" value="Easy"                             
                        onChange={e => handleCheckboxChange(e, 'difficulty')}/></label>
                        <label>Medium <input type="checkbox" className="difficulty" value="Medium" 
                        onChange={e => handleCheckboxChange(e, 'difficulty')} /></label>
                        <label>Hard <input type="checkbox" className="difficulty" value="Hard" 
                        onChange={e => handleCheckboxChange(e, 'difficulty')}/></label>
                    </div>
                    <div className="divider"></div> 
                    <div className="filterSection">
                        <h4>Category</h4>
                        <label>Sports <input type="checkbox" className="category" value="sports" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>Music <input type="checkbox" className="category" value="music" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>General knowledge <input type="checkbox" className="category" value="general_knowledge" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                        <label>Other <input type="checkbox" className="category" value="other" 
                        onChange={e => handleCheckboxChange(e, 'category')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>Fee</h4>
                        <label>Less than 5 <input type="checkbox" className="price" value="5" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                        <label>Less than 10 <input type="checkbox" className="price" value="10" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                        <label>Less than 15 <input type="checkbox" className="price" value="15" 
                        onChange={e => handleCheckboxChange(e, 'price')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>League</h4>
                        <label>Yes <input type="checkbox" className="is_league" value="true" 
                        onChange={e => handleCheckboxChange(e, 'is_league')}/></label>
                        <label>No <input type="checkbox" className="is_league" value="false" 
                        onChange={e => handleCheckboxChange(e, 'is_league')}/></label>
                    </div>
                    <div className="divider"></div>
                    <div className="filterSection">
                        <h4>Distance</h4>
                        <label>Closest <input type="checkbox" className="distance" value="closest" 
                        onChange={e => handleCheckboxChange(e, 'distance')}/></label>
                        <label>Farthest <input type="checkbox" className="distance" value="farthest" 
                        onChange={e => handleCheckboxChange(e, 'distance')}/></label>
                    </div>
                </div>
            </div>
                {allQuizzes.map((quiz) => (
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
            </div>
        }

        {!showQuizPopup & showAllQuizzes & allQuizzes.length > 0?
        
            <div className='quizzes'>
                {allQuizzes.map((quiz) => (
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
                        <p>Organizer: {quiz.organizer}</p> 
                        
                                                        
                    </div>

                    <div className="reviews">
                        <h4>Reviews for {quiz.organizer}:</h4>
                        {reviews
                            .filter((review) => review.quiz === quiz.id) // Filter reviews for the current quiz
                            .map((review) => (
                                <div key={review.id} className="review">
                                    <p><strong>Rating:</strong> {review.rating}/5</p>
                                    <p><strong>Comment:</strong> {review.comments}</p>
                                </div>
                            ))}
                    </div>
                    <div className='prijava'>
                        <button id='prijaviSe' onClick={() => handleDeleteQuiz(quiz.id)}>
                            Delete
                        </button>
                    </div>
                    
                </div>
                ))}
            </div> : null
        }

        {!showQuizPopup & viewUsers ?
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
                        Delete
                    </button>
                </div>
                
            </div> 
            ))}

        </div>: null}

        {!showQuizPopup & viewTeams ?
            <div className='quizzes'>
            {teams.map((team) => (
                <div className='kviz' key={team.id}>
                    <div className='nazivKviza'>{team.name}</div>
                    <div className='opisKviza'>
                        <p className='opis'>Team members count: {team.members_count}</p>
                    </div>
                <div className='informacije'>
                    <p> Quiz: {team.quiz}</p>	
                </div>
                <div className='prijava'>
                    <button id='prijaviSe' onClick={() => handleDeleteTeam(team.id)}>
                        Delete
                    </button>
                </div>
                
            </div>
            ))}

        </div>:null}


        {!showQuizPopup & viewReviews ? 
            <div className='quizzes'>
            {reviews.map((review) => (
                <div className='kviz' key={review.id}>
                    <div className='nazivKviza'>Quiz: {review.quiz}</div>
                    <div className='opisKviza'>
                        <p className='opis'>Rating: {review.rating} </p>
                        <p className='opis'> {review.comments} </p>	
                    </div>
                <div className='informacije'>
                    <p >User: {review.user} </p>
                    <p >Created at: {review.created_at} </p>
                    
                </div>
                <div className='prijava'>
                    <button id='prijaviSe' onClick={() => handleDeleteReview(review.id)}>
                        Delete
                    </button>
                </div>
                
            </div>
            ))}

        </div>:null}

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
                    <button id='navButtons' className={pageLocation.pathname === '/quiz' ? 'active' : ''} onClick={()=> {setShowAllQuizzes(false); setShowQuizPopup(false); setShowTeamPopup(false);setViewTeams(false);setViewReviews(false); setViewUsers(false)}}> Home</button>
                    <button id='navButtons' className={pageLocation.pathname === '/my-archive' ? 'active' : ''} onClick={() => handleNavigation('/my-archive')}> My archive</button>
                    <button id='navButtons' className={pageLocation.pathname === '/maps' ? 'active' : ''} onClick={() => navigate('/maps')}>Maps</button>
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
