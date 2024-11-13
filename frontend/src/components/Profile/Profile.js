import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../../services/api';
import './profileStyles.css';

const Profile = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleUsernameChange = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.put(
                '/api/users/change-username/',
                { username: newUsername },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            localStorage.setItem('username', newUsername); // Azuriraj trenutno ime u localStorageu
            setFeedback('Username successfully updated.');
            setShowUsernameForm(false); // Makni nakon submitanja
        } catch (error) {
            setFeedback('Failed to update username.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.post(
                '/accountManager/changePassword/',
                { 
                    old_password: currentPassword,
                    new_password: newPassword }, // Proverite naziv polja
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            setFeedback('Password successfully updated.');
            setShowPasswordForm(false); // Sakrij formu nakon ažuriranja
        } catch (error) {
            setFeedback('Failed to update password.');
        }
    };

    return (
        <div>
            <div className='pozdrav'>
                <p className='helloText'>
                    Hello, {localStorage.getItem('username')}!
                </p>
            </div>

            <button className='goToHomePage'id='changeButton' onClick={()=>navigate('/Quiz')}> Go to home page</button>

            <p>{feedback}</p>

            <button
                id='changeButton'
                onClick={() => {
                    setShowUsernameForm(!showUsernameForm);
                    setShowPasswordForm(false); // Close password form if open
                }}> 
                Change username
            </button>

            {showUsernameForm && (
                <form onSubmit={handleUsernameChange} className='changeForm'>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New Username"
                        required
                    />
                    <button type="submit">Update Username</button>
                </form>
            )}

            <button
                id='changeButton'
                onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setShowUsernameForm(false); // Close username form if open
                }}>
                Change password
            </button>

            {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className='changeForm'>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    required
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                />
                <button type="submit">Update Password</button>
            </form>
            )}

            <button className='logoutButton' id='changeButton' onClick={logout} >
                Logout
            </button>
        </div>
    );
};

export default Profile;