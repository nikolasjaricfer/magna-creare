import React, { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {jwtDecode} from 'jwt-decode';

const RegComplete = () =>{

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('TajnaVeza420');
    const [password2, setPassword2] = useState('TajnaVeza420');
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Access the login function from AuthContext

    useEffect(() => {
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.substring(1)); // Parsiraj hash
            const idToken = params.get('id_token');
        
            if (idToken) {
                try {
                    const decoded = jwtDecode(idToken);
                    console.log("Decoded Token:", decoded);
        
                    // Čistimo i postavljamo vrednosti
                    const name = (decoded.name || decoded.preferred_username || '').trim();
                    const email = (decoded.email || '').trim();
        
                    console.log("Extracted Name:", name);
                    console.log("Extracted Email:", email);
        
                    setUsername(name.replace(/[\s\t\n\r]+/g, ''));
                    setEmail(email);
                } catch (err) {
                    console.error('Invalid token:', err);
                    setError('Failed to decode token');
                }
            }
        }, []); // Prazan niz zavisnosti

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            setError('Passwords must match');
            return;
        }

        localStorage.setItem('username', username);
        //setRole(role);
        console.log(username)
        console.log(email)
        console.log(role)
        console.log(password)
        console.log(password2)


        try {
            const response = await api.post('register/', {
                username,
                email,
                password,
                password2,
                role

            });

            //console.log(response)

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
                    // Handle different types of errors
        if (err.response) {
            // Server responded with an error
            if (err.response.status === 400) {
                // Bad request (validation errors, etc.)
                setError(err.response?.data?.detail || 'Invalid data submitted');
            } else if (err.response.status === 500) {
                // Internal server error
                setError('Server error. Please try again later.');
            } else {
                // General error
                setError(err.response?.data?.detail || 'An unexpected error occurred');
            }
            console.error('Error response:', err.response); // Log the entire error response for debugging
        } else if (err.request) {
            // The request was made but no response was received
            setError('Network error. Please check your internet connection.');
            console.error('Error request:', err.request); // Log the request for debugging
        } else {
            // Something else happened while setting up the request
            setError('An error occurred. Please try again.');
            console.error('Error:', err.message); // Log the error message
        }
    }
        
    };

    return (
  
    <div>

    <div className="zavrsi"> Complete your registration</div>
    {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
                <form onSubmit={handleSubmit}>
                
                <div hidden>
                    <label>Password</label>
                    <input
                        type="password"
                        value='TajnaVeza420'
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder='Password'
                    />
                </div>
                <div hidden>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value='TajnaVeza420'
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
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="user">User</option>
                        <option value="quizmaker">QuizMaker</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    </div>
)}

export default RegComplete;