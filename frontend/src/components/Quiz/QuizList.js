// src/components/Quiz/QuizList.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import user_icon from './user_icon.png'
import './quizListStyles.css'


const QuizList = () => {

    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div>

    <div className='homeTop'>
        <h3 className='ime'>Quiz finder</h3>
            <button id='profileButton' onClick={() => navigate('/Profile')}>
                <img className='userImg' src={user_icon} alt='user_icon'></img>
            </button>

    </div>
            <div className='kviz'>
                
                <div className='nazivKviza'>Ime kviza</div>
                <div className='opisKviza'> 
                    <p className='opis'> Kafic xyz, adresa abc, kotizacija, bla bla bla bla</p>
                </div>
                
                <div className='slikaKviza'> *insert sliku kviza
                    <button id='prijaviSe'> Prijavi se</button>
                </div>
            </div>
    <div className='navigacija'>

        <div className='buttons'>

            <button id='navButtons'> Home</button>
            <button id='navButtons'> My archive</button>
            <button id='navButtons'> Maps </button>

        </div>

    </div>
        {/* Quiz list goes here */}




        </div>
    );
};

export default QuizList;
