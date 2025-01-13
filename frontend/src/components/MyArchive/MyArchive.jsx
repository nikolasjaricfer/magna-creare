import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import api from '../../services/api';
import { FaStar } from 'react-icons/fa';
import './MyArchiveStyles.css';

const MyArchive = () => {
    const token = localStorage.getItem('token');
    const userId = parseInt(localStorage.getItem('id'), 10);
    const userRole = localStorage.getItem('role');
    const navigate = useNavigate();
    const pageLocation = useLocation();

    const [archivedQuizzes, setArchivedQuizzes] = useState([]);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [submittedReviews, setSubmittedReviews] = useState({});
    const [hover, setHover] = useState({}); // Hover state for tooltips

    const ratingDescriptions = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    // Check if a quiz has ended
    const isQuizEnded = (quiz) => {
        const quizStartMs = new Date(quiz.start_time).getTime();
        const quizDurationMs = quiz.duration * 60_000;
        const quizEndTime = quizStartMs + quizDurationMs;
        return Date.now() >= quizEndTime;
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchArchivedQuizzesAndReviews = async () => {
            try {
                const teamsResp = await api.get('api/teams/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (teamsResp.status !== 200) {
                    setError('Failed to fetch teams.');
                    return;
                }
                const allTeams = teamsResp.data;
                const myTeams = allTeams.filter((team) => team.registered_by === userId);
                const quizIdsIJoined = myTeams.map((t) => t.quiz);

                const quizzesResp = await api.get('api/quizzes/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (quizzesResp.status !== 200) {
                    setError('Failed to fetch quizzes.');
                    return;
                }
                const allQuizzes = quizzesResp.data;
                const endedAndJoined = allQuizzes.filter((q) => {
                    const joined = quizIdsIJoined.includes(q.id);
                    const ended = isQuizEnded(q);
                    return joined && ended;
                });
                setArchivedQuizzes(endedAndJoined);

                const reviewsResp = await api.get('api/reviews/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (reviewsResp.status === 200 && reviewsResp.data) {
                    const allReviews = reviewsResp.data;
                    const myReviews = allReviews.filter((r) => r.user === userId);

                    const userReviewsMap = {};
                    myReviews.forEach((r) => {
                        userReviewsMap[r.quiz] = {
                            rating: r.rating,
                            comments: r.comments || '',
                        };
                    });
                    setSubmittedReviews(userReviewsMap);
                }
            } catch (err) {
                console.error('Error fetching archive quizzes or reviews:', err);
                setError('Error fetching your archive quizzes.');
            }
        };

        fetchArchivedQuizzesAndReviews();
    }, [token, userId]);

    const handleRatingChange = (quizId, ratingValue) => {
        setRatings((prev) => ({ ...prev, [quizId]: ratingValue }));
    };

    const handleCommentChange = (quizId, newComment) => {
        setComments((prev) => ({ ...prev, [quizId]: newComment }));
    };

    const handleSubmitRating = async (quizId) => {
        try {
            const ratingValue = ratings[quizId] || '';
            const commentValue = comments[quizId] || '';

            if (!ratingValue) {
                alert('Please select a rating.');
                return;
            }

            await api.post(
                'api/reviews/',
                {
                    quiz: quizId,
                    rating: ratingValue,
                    comments: commentValue,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert('Rating submitted successfully!');
            setSubmittedReviews((prev) => ({
                ...prev,
                [quizId]: {
                    rating: ratingValue,
                    comments: commentValue,
                },
            }));
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'An error occurred while submitting the rating.'
            );
            console.log('Review error data:', err.response?.data);
        }
    };

    return (
        <div>
            <div className="homeTop">
                <h3 className="ime">QUIZFINDER</h3>
                <button id="profileButton" onClick={() => navigate('/Profile')}>
                    <img className="userImg" src={user_icon} alt="user_icon" />
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="quizzes">
                {archivedQuizzes.map((quiz) => {
                    const alreadyReviewed = submittedReviews[quiz.id] !== undefined;

                    return (
                        <div className="arhivirani-kviz" key={quiz.id}>
                            <div className="nazivKviza">{quiz.title}</div>
                            <div className="opisKviza">
                                <p className="opis">{quiz.description}</p>
                            </div>
                            <div className="arhivirane-informacije">
                                <p>Category: {quiz.category}</p>
                                <p>Difficulty: {quiz.difficulty}</p>
                                <p>Start: {new Date(quiz.start_time).toLocaleString()}</p>
                                <p>
                                    Deadline:{' '}
                                    {new Date(quiz.registration_deadline).toLocaleString()}
                                </p>
                            </div>

                            {alreadyReviewed ? (
                                <div className="already-rated">
                                    <p>
                                        <strong>Your rating:</strong>{' '}
                                        {submittedReviews[quiz.id].rating}
                                    </p>
                                    <p>
                                        <strong>Your comments:</strong>{' '}
                                        {submittedReviews[quiz.id].comments}
                                    </p>
                                </div>
                            ) : (
                                <div className="rating">
                                    <div className="star-rating">
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;

                                            return (
                                                <FaStar
                                                    key={ratingValue}
                                                    size={24}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color:
                                                            ratingValue <=
                                                            (ratings[quiz.id] || hover[quiz.id] || 0)
                                                                ? '#ffc107'
                                                                : '#e4e5e9',
                                                    }}
                                                    title={ratingDescriptions[ratingValue - 1]}
                                                    onClick={() =>
                                                        handleRatingChange(quiz.id, ratingValue)
                                                    }
                                                    onMouseEnter={() =>
                                                        setHover((prev) => ({
                                                            ...prev,
                                                            [quiz.id]: ratingValue,
                                                        }))
                                                    }
                                                    onMouseLeave={() =>
                                                        setHover((prev) => ({
                                                            ...prev,
                                                            [quiz.id]: 0,
                                                        }))
                                                    }
                                                />
                                            );
                                        })}
                                    </div>

                                    <label>Comments:</label>
                                    <textarea
                                        placeholder="Your thoughts on this quiz"
                                        value={comments[quiz.id] || ''}
                                        onChange={(e) =>
                                            handleCommentChange(quiz.id, e.target.value)
                                        }
                                    />

                                    <button
                                        id="submit"
                                        onClick={() => handleSubmitRating(quiz.id)}
                                    >
                                        Submit Rating
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

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
                    {userRole === 'quizmaker' && (
                        <button id="navButtons" onClick={() => navigate('/add-quiz')}>
                            Add Quiz
                        </button>
                    )}
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
