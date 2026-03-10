//Communicator between frontend and backend OR A custom Axios instance

import axios from "axios";//JavaScript library used to make HTTP requests.

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL //This sets default base URL.
    //Now whenever we call API.get("/notes") It automatically becomes "http://localhost:5000/api/notes"
});

// FIX 1: Added request interceptor to automatically attach the JWT token to every request.
// Without this, all /api/notes calls fail with 401 Unauthorized because the backend's
// protect middleware checks for "Authorization: Bearer <token>" on every note route.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

//This exports the API instance. So other files can import and use it.
export default API; 



