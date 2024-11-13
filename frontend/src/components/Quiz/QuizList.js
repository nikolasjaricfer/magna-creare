// src/components/Quiz/QuizList.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const QuizList = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <h2>Quizzes</h2>
            {/* Logout button */}
            <button onClick={logout} style={{ marginTop: '10px', cursor: 'pointer' }}>
                Logout
            </button>
            {/* Quiz list goes here */}
        </div>
    );
};

export default QuizList;
