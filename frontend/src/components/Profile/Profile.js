import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const Profile = () => {

    const navigate = useNavigate();

    return (
        <div>
            <p className='pozdrav'>Hello, {localStorage.getItem('username')}</p>

            <button>Change password</button>
            <button>Change username</button>
        </div>
    );
};

export default Profile;