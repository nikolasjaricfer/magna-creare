// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { APIProvider } from '@vis.gl/react-google-maps';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import QuizList from './components/Quiz/QuizList';
import Profile from './components/Profile/Profile';
import Contacts from './components/Contacts/Contacts';
import RegComplete from './components/Auth/RegComplete';
import LogComplete from './components/Auth/LogComplete';
import MapsPage from './components/Google/GoogleMapsPage';
import MyArchive from './components/MyArchive/MyArchive';

const App = () => {
    return (
        <AuthProvider>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_KEY}>
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
                        <Route path="/maps" element={<MapsPage />} />
                        <Route path="/my-archive" element={<MyArchive />} />
                    </Routes>
                </Router>
            </APIProvider>
        </AuthProvider>
    );
};

export default App;
