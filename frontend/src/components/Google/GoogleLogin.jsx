import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';

const MojGoogleLogin = () => {
    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;

            const response = await api.post("/auth/google/", {token: credential})
            console.log('Login successful:', response.data);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <GoogleOAuthProvider clientId="589349770345-uhs8f2q9f7c13dg3vohif9mbbej3l1nf.apps.googleusercontent.com">
            <div>
                <h1>Google Login</h1>
                <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log('Login Failed')} />
            </div>
        </GoogleOAuthProvider>
    );
};

export default MojGoogleLogin;
