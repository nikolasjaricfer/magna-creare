import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import './profileStyles.css'

const Profile = () => {

    const navigate = useNavigate();
    

    return (
        <div>
            <div className='pozdrav'>
                <p className='helloText'>
                    Hello, {localStorage.getItem('username')}!
                </p>           
            </div>
            
            <button className='goToHomePage'id='changeButton' onClick={()=>navigate('/Quiz')}> Go to home page</button>
            <button id='changeButton'> Change username </button>
            <button id='changeButton'> Change password </button>
        </div>
    );
};

export default Profile;