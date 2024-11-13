// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import QuizList from './components/Quiz/QuizList';
import ChangePasswordForm from './components/Auth/ChangePasswordForm';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/quiz" element={<QuizList />} />
                    <Route path="/accountManager/changePassword" element={<ChangePasswordForm />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
