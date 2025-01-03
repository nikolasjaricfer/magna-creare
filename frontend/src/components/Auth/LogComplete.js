import React, { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Pravilno importovanje jwtDecode
import { AuthContext } from '../../context/AuthContext';

const LogComplete = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('TajnaVeza420'); // Pretpostavljena lozinka
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Pristup login funkciji iz AuthContext

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

        //console.log(email)
        //console.log(username)
        
        if (!username) {
            setError('Username is missing. Please ensure the token contains valid information.');
            return;
        }
            //console.log(email)
            //console.log(username)
            localStorage.setItem('username', username)

        try {
            const response = await api.post('token/', {
                username,
                password,
            });
            console.log(response.data)
            setRole(response.data.role); // Postavljanje uloge iz odgovora

            localStorage.setItem('username', username);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('id', response.data.id);

            // Poziv login funkcije sa tokenima
            login({
                access: response.data.access,
                refresh: response.data.refresh,
            });

            // Preusmeravanje na /quiz nakon uspešnog logovanja
            navigate('/quiz');
        } catch (err) {
            // Obrada grešaka
            if (err.response) {
                if (err.response.status === 400) {
                    setError(err.response?.data?.detail || 'Invalid data submitted');
                } else if (err.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(err.response?.data?.detail || 'An unexpected error occurred');
                }
                console.error('Error response:', err.response);
            } else if (err.request) {
                setError('Network error. Please check your internet connection.');
                console.error('Error request:', err.request);
            } else {
                setError('An error occurred. Please try again.');
                console.error('Error:', err.message);
            }
        }
    };

    return (
        <div>
            <div className="zavrsi">Continue with logging in</div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <form onSubmit={handleSubmit}>
                    <button type="submit">Continue</button>
                </form>
            </div>
        </div>
    );
};

export default LogComplete;
