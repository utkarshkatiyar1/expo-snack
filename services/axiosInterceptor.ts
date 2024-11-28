import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { router } from 'expo-router';

// Create an Axios instance

const axiosInstance = axios.create({
  baseURL: 'https://api-staging.loannetwork.app', // Replace with your API base URL
  timeout: 10000, // Request timeout in milliseconds
});

// Request Interceptor

axiosInstance.interceptors.request.use(
  async (config) => {
    // Add authorization token or any custom headers
    const token = await AsyncStorage.getItem("auth_token"); // Replace with your token logic
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging or modifying the request
    console.log(`[Request] ${config.method?.toUpperCase()} -> ${config.url}`, config);

    return config;
  },
  (error) => {
    // Handle request error
    // console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Logging or processing the response
    console.log(`[Response] ${response.config.url}`, response.data);

    return response;
  },
  (error) => {
    // Handle response errors (e.g., 401, 403, etc.)
    if (error.response) {
    //   console.error(`[Response Error] ${error.response.status}`, error.response.data);
      if(error.response.status === 401) {
        // Handle unauthorized access
       router.push('/login');
      }
    } else {
      console.error('[Response Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
