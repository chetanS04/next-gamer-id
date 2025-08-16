// utils/axios.ts or in component
import axios from 'axios';

const instance = axios.create({
  // baseURL: 'http://localhost:8000',
  baseURL: 'https://www.api.idbazaar.topntech.com',
  withCredentials: true,
});



instance.interceptors.request.use((config) => {
  const token = getCookieValue('XSRF-TOKEN');
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});

function getCookieValue(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export default instance;




// const releaseEscrow = async (escrowId: number) => {
//   const res = await axios.post(`/admin/escrow/release/${escrowId}`);
//   return res.data;
// };



// const initiateEscrow = async (sellerId: number, amount: number, listingId?: number) => {
//   const res = await axios.post('/escrow/initiate', {
//     seller_id: sellerId,
//     amount,
//     listing_id: listingId,
//   });

//   return res.data;
// };





// const addFunds = async (amount: number) => {
//   const res = await axios.post('/wallet/add-funds', { amount });
//   return res.data;
// };
