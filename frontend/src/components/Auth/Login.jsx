// src/components/Auth/Login.js
import React, { useState, useContext, useEffect } from 'react';
import './authStyles.css';
import api from '../../services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility


    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Get login function from AuthContext

    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const location = useLocation(); // Dobijate trenutni URL

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('api/token/', { username, password });
            //console.log(response);
            login(response.data); // Use login from AuthContext to set tokens and state
            localStorage.setItem('username', username);
            localStorage.setItem('role', response.data.role);////////
            localStorage.setItem('id', response.data.id)
            navigate('/quiz');

        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials or server error');
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftLogin = async (e) =>{

        const generateNonce = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let nonce = '';
            for (let i = 0; i < 16; i++) {
                nonce += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return nonce;
        };

        var uri = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
        uri = uri + 'client_id=e1f95fb2-8257-4b4b-bb1a-f9cad552128e'
        uri = uri + '&response_type=code id_token'
        uri = uri + '&redirect_uri=http://localhost:3000/logComplete'
        uri = uri + '&scope=openid profile email User.Read'
        uri = uri + '&nonce=${nonce}'
        //uri = uri + '&response_mode=query'
        window.location.assign(uri);
        return false;

    }

         // Function to toggle the dropdown visibility
    const toggleDropdownInfo = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    

    return (
        <div className="container">
            <h2>Login - QuizFinder</h2>
            
               {/* Dropdown Info Section */}
               <div className="dropdownInfo">
                <button
                    className="dropdownInfoButton"
                    onClick={toggleDropdownInfo}
                >
                    More Info
                </button>
                {/* Conditionally show dropdown content */}
                
                {isDropdownOpen && 
                <div className='info-text'> 
                   <h1>Welcome to QuizFinder</h1>
                        <p>QuizFinder is a unique platform designed for pub quiz enthusiasts and organizers who want to expand their audience. Our application offers:</p>

                        <ul>
                            <strong>For quiz enthusiasts:</strong>
                            <ul>
                                <li>Easy quiz search by location, category, and difficulty.</li>
                                <li>Display of all available quizzes on an interactive map through Google Maps integration.</li>
                                <li>Option to apply and leave a review of the quiz.</li>
                            </ul>
                            <br></br>
                            
                            <strong>For organizers:</strong>
                            <ul>
                                <li>Quick and easy quiz publishing of information.</li>
                                <li>Ability to get feedback on quizzes via reviews.</li>
                            </ul>
                        </ul>
                        <br></br>
                        <p>Join the QuizFinder community and make your quiz experience unforgettable!</p>
                        <p><em>Your new favorite quiz destination - <strong>QuizFinder.</strong></em></p>

                </div>
                }
                 
                        
                    
                
               
        </div>


            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="username">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username"
                    />
                </div>
                <div className="password">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <button id="guestButton" onClick={() => {
                                                    localStorage.setItem('role', 'guest');
                                                    navigate('/quiz');
    }}>
                    Continue as guest
                </button>
                
            </form>
            <button id="googleButton" onClick={handleMicrosoftLogin}>Login with microsoft</button>

            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
