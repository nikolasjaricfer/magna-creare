import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import './quizListStyles.css';
import './quizStyles.css';
import api from '../../services/api';

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
            await api.post('/quizzes/', {
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
            await api.post('/teams/', {
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

    return (
        <div>
            <div className='homeTop'>
                <h3 className='ime'>QUIZFINDER</h3>
                <button id='profileButton' onClick={() => navigate('/Profile')}>
                    <img className='userImg' src={user_icon} alt='user_icon' />
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!showQuizPopup && !showTeamPopup && 
                <div className='quizzes'>
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
                            <div className='prijava'>
                                <button 
                                    id='prijaviSe' 
                                    onClick={() => {
                                        setShowTeamPopup(true); // Open the team submission popup
                                        setQuizIdToJoin(quiz.id); // Set the quiz ID for the team submission
                                    }}
                                    disabled={appliedQuizzes.includes(quiz.id)} // Disable button if already applied
                                >
                                    {appliedQuizzes.includes(quiz.id) ? 'Already Applied' : 'Prijavi se'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            }

            {/* Quiz creation popup */}
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
                            <input
                                type="text"
                                id='quizInput'
                                placeholder="Location"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
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
                    <button id='navButtons' className={pageLocation.pathname === '/quiz' ? 'active' : ''}> Home</button>
                    <button id='navButtons' className={pageLocation.pathname === '/my-archive' ? 'active' : ''} onClick={() => navigate('/my-archive')}> My archive</button>
                    <button id='navButtons' className={pageLocation.pathname === '/maps' ? 'active' : ''} onClick={() => navigate('/maps')}> Maps </button>
                    {userRole === 'quizmaker' && (
                        <button id="navButtons" onClick={() => setShowQuizPopup(true)}>Add Quiz</button>
                    )}
                </div>
                <div className='contactButton'>
                    <button id='contacts' onClick={() => navigate('/contacts')}>Developer contacts</button>
                </div>
            </div>
        </div>
    );
};

export default QuizList;
