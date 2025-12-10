import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
    baseURL: "http://localhost:4455/",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

API.interceptors.request.use((config) => {
    const token = Cookies.get('userToken');
    console.log('[API] Making request to:', config.url);
    console.log('[API] Token present:', !!token);
    if (token) {
        console.log('[API] Token (first 20 chars):', token.substring(0, 20));
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('[API] No token found in cookies!');
    }
    return config;
});

API.interceptors.response.use(
    (response) => {
        console.log('[API] Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('[API] Request failed:', error.response?.status, error.response?.statusText);
        console.error('[API] Error details:', error.response?.data);
        if (error.response && error.response.status === 401) {
            console.error('[API] 401 Unauthorized - redirecting to login');
            if (typeof window !== 'undefined') {
                Cookies.remove('userToken');
                Cookies.remove('usuarioData');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default API;