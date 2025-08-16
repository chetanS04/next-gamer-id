import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://www.api.idbazaar.topntech.com',
  withXSRFToken: true,
  withCredentials: true,
});



instance.interceptors.request.use((config) => {
  //const token = getCookieValue('XSRF-TOKEN');
  const token = localStorage.getItem("token");
  if (token) {
    config.headers['Authorization'] = `Bearer ${decodeURIComponent(token)}`;
  }
  return config;
});



export default instance;


 







