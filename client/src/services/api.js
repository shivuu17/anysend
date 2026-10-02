import axios from 'axios';
import { getApiBaseUrl } from '../utils/network.js';

const api = axios.create({
  baseURL: getApiBaseUrl() + '/api',
  timeout: 30000,
});

export default api;
