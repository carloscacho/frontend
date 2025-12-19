import axios from "axios";
import Cookies from "js-cookie";

// Cookie expiration: 5 days (same as refresh token)
const COOKIE_EXPIRATION_DAYS = 5;

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4455/",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - add token to requests
API.interceptors.request.use((config) => {
    const userCookies = Cookies.get('usuarioData');
    if (userCookies) {
        try {
            const { token } = JSON.parse(userCookies);
            console.log('[API] Making request to:', config.url);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('[API] Error parsing user cookies');
        }
    }
    return config;
});

// Response interceptor - handle 401 and refresh token
API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Don't try to refresh if this is already a refresh request
            if (originalRequest.url?.includes('/auth/refresh')) {
                console.error('[API] Refresh token expired - logging out');
                performLogout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return API(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.error('[API] Token refresh failed - logging out');
                performLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('[API] Request failed:', error.response?.status, error.response?.statusText);
        return Promise.reject(error);
    }
);

/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} New access token
 */
async function refreshAccessToken() {
    const userCookies = Cookies.get('usuarioData');
    if (!userCookies) {
        throw new Error('No user data found');
    }

    const userData = JSON.parse(userCookies);
    const refreshToken = userData.refreshToken;

    if (!refreshToken) {
        throw new Error('No refresh token found');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    const newAccessToken = data.access_token;

    // Update stored token
    const updatedUser = { ...userData, token: newAccessToken };
    Cookies.set('usuarioData', JSON.stringify(updatedUser), { expires: COOKIE_EXPIRATION_DAYS });

    console.log('[API] Token refreshed successfully');
    return newAccessToken;
}

/**
 * Perform logout - clear cookies and redirect
 */
function performLogout() {
    Cookies.remove('userToken');
    Cookies.remove('usuarioData');
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
}

export default API;
