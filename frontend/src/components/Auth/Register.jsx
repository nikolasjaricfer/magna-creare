import React, { useState, useContext } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Access the login function from AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            setError('Passwords must match');
            return;
        }

        localStorage.setItem('username', username);

        try {
            const response = await api.post('register/', {
                username,
                email,
                password,
                password2,
                role,
            });

            localStorage.setItem('role', role);
            localStorage.setItem('id', response.data.user.id)

            // Call the login function with the token from registration response
            login({
                access: response.data.access_token,
                refresh: response.data.refresh_token,
            });

            // Redirect to /quiz after successful registration
            navigate('/quiz');
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred');
        }
    };

    const handleMicrosoftLogin = async(e)=>{

        const generateNonce = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let nonce = '';
            for (let i = 0; i < 16; i++) {
                nonce += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return nonce;
        };

        //navigate('/auth/microsoft/login');
        window.location.assign('https://quizfinder.onrender.com/auth/microsoft/login/');
        //window.location.assign('http://localhost:8000/auth/microsoft/login/');
        //window.location.assign('http://localhost:8000/auth/microsoft/login/');
        var uri = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
        uri = uri + 'client_id=e1f95fb2-8257-4b4b-bb1a-f9cad552128e'
        uri = uri + '&response_type=code id_token'
        uri = uri + '&redirect_uri=http://localhost:3000/regComplete'
        uri = uri + '&scope=openid profile email User.Read'
        uri = uri + '&nonce=${nonce}'
        //uri = uri + '&response_mode=query'
        window.location.assign(uri);
        return false;


        //const response = await api.post('auth/microsoft/login/')
    }


    return (
        <div className='container'>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder='Username'
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder='Email'
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder='Password'
                    />
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        placeholder='Confirm password'
                    />
                </div>
                <div>
                    <label>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required>
                        <option value="">Select Role</option>
                        <option value="user">User</option>
                        <option value="quizmaker">QuizMaker</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
            <button id="googleButton" onClick={handleMicrosoftLogin}>Register with Microsoft</button>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;
