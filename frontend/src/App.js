// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import QuizList from './components/Quiz/QuizList';
import Profile from './components/Profile/Profile';
import Contacts from './components/Contacts/Contacts';
import RegComplete from './components/Auth/RegComplete';
import LogComplete from './components/Auth/LogComplete';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login/>} /> 
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/quiz" element={<QuizList />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/regComplete" element={<RegComplete />} />
                    <Route path="/logComplete" element={<LogComplete />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
