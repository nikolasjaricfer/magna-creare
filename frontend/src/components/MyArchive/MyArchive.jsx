import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import user_icon from './user_icon.png';
import api from '../../services/api';
import './MyArchiveStyles.css';

const MyArchive = () => {
    const token = localStorage.getItem('token');
    const userId = parseInt(localStorage.getItem('id'), 10);
    const userRole = localStorage.getItem('role');
    const navigate = useNavigate();
    const pageLocation = useLocation();

    const [archivedQuizzes, setArchivedQuizzes] = useState([]);
    const [error, setError] = useState(null);

    // Local states for rating/comment
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});

    // This map will store quizId -> { rating, comments } for quizzes the user already reviewed
    const [submittedReviews, setSubmittedReviews] = useState({});

    // Check if a quiz ended
    const isQuizEnded = (quiz) => {
        const quizStartMs = new Date(quiz.start_time).getTime();
        const quizDurationMs = quiz.duration * 60_000;
        const quizEndTime = quizStartMs + quizDurationMs;
        return Date.now() >= quizEndTime;
    };

    // Fetch data on mount
    useEffect(() => {
        const fetchArchivedQuizzesAndReviews = async () => {
            try {
                // 1) GET all teams
                const teamsResp = await api.get('/teams/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (teamsResp.status !== 200) {
                    setError('Failed to fetch teams.');
                    return;
                }
                const allTeams = teamsResp.data;
                // Filter for teams where registered_by == userId
                const myTeams = allTeams.filter((team) => team.registered_by === userId);
                const quizIdsIJoined = myTeams.map((t) => t.quiz);

                // 2) GET all quizzes
                const quizzesResp = await api.get('/quizzes/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (quizzesResp.status !== 200) {
                    setError('Failed to fetch quizzes.');
                    return;
                }
                const allQuizzes = quizzesResp.data;
                // ended + user joined
                const endedAndJoined = allQuizzes.filter((q) => {
                    const joined = quizIdsIJoined.includes(q.id);
                    const ended = isQuizEnded(q);
                    return joined && ended;
                });
                setArchivedQuizzes(endedAndJoined);

                // 3) GET all reviews
                const reviewsResp = await api.get('/reviews/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (reviewsResp.status === 200 && reviewsResp.data) {
                    // Filter only reviews for this user
                    const allReviews = reviewsResp.data;
                    const myReviews = allReviews.filter((r) => r.user === userId);

                    // Build a map: quizId -> {rating, comments}
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

            // POST /reviews/
            await api.post(
                '/reviews/',
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
            // If successful, store it in local state so we hide the UI
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
                    // If we have an entry for this quiz in submittedReviews,
                    // user has already reviewed it.
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
                                    <label>Rate this quiz:</label>
                                    <select
                                        onChange={(e) =>
                                            handleRatingChange(quiz.id, e.target.value)
                                        }
                                        value={ratings[quiz.id] || ''}
                                    >
                                        <option value="">Select rating</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>

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
