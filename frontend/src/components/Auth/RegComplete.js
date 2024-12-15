import React, { useState, useContext } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RegComplete = () =>{

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

    return (
  
    <div>

    <div class="zavrsi"> Complete your registration</div>
        <div>
                <form onSubmit={handleSubmit}>
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