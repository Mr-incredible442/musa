import axios from 'axios';
import { LOCAL_URL } from './variables';

// Create an Axios instance
const apiCall = axios.create();

// Add a request interceptor
apiCall.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    if (user?.firstName) {
      config.headers['X-Name'] = user.firstName + ' ' + user.lastName;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiCall.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized error
    if (error.response?.status === 401) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        axios.post(`${LOCAL_URL}/users/logout`, { token });
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiCall;
