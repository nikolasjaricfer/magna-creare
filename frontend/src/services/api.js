import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:8000/',  // Change to your Django API URL
    baseURL: 'https://quizfinder.onrender.com/',
});

// Add authorization headers if the user is authenticated
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
