// lib/auth.ts
import axios from './axios';

// 1. Get CSRF cookie (required before login/logout/register)
export const getCSRF = () => axios.get('/sanctum/csrf-cookie');

// 2. Register
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  await getCSRF();
  return axios.post('/api/register', data);
};

// 3. Login
export const login = async (email: string, password: string) => {
  await getCSRF();
  const response = await axios.post('/api/login', { email, password });
  return response.data; // return the full response data
};


// 4. Logout
export const logout = async () => {
  await getCSRF(); // Optional if already logged in
  localStorage.removeItem('user'); // Optional: remove cached user
  return axios.post('/logout');
};

// 5. Get current authenticated user
export const getUser = () => axios.get('/api/user');
