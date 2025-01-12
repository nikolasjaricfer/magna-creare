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

    return (
        <div className="container">
            <h2>Login</h2>
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
            </form>
            <button id="googleButton" onClick={handleMicrosoftLogin}>Login with microsoft</button>

            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
