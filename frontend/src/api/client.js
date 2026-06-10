import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:8000' });

export const getWells = (limit = 100, skip = 0) =>
  client.get('/wells', { params: { limit, skip } });

export const getWell = (uwi) =>
  client.get(`/wells/${encodeURIComponent(uwi)}`);

export const getProduction = (uwi) =>
  client.get(`/production/${encodeURIComponent(uwi)}`);

export const getForecast = (uwi) =>
  client.get(`/forecast/${encodeURIComponent(uwi)}`);

export default client;
