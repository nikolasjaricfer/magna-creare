import axios from 'axios';

const api = axios.create({

    baseURL: 'https://quiz-finder.onrender.com/',  // Change to your Django API URL
    withCredentials:true
    //baseURL: 'https://quiz-finder.onrender.com/',

});

// Add authorization headers if the user is authenticated
api.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);
  


api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      // Handle token expiration
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axios.post(`https://quiz-finder.onrender.com/api/token/refresh/`, {
            refresh: refreshToken,
          });
  
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error('Refresh token failed', err);
          // Optionally, handle logout here
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
);

export default api;
