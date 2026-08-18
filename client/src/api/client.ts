import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({ baseURL: API_BASE });

export const fetchJobs = (page = 1, search = '', source = 'all') =>
  api.get('/jobs', { params: { page, limit: 12, search, source } }).then((r) => r.data);

export const fetchSources = () =>
  api.get('/jobs/sources').then((r) => r.data);

export const triggerIngestion = () =>
  api.post('/ingestion/run').then((r) => r.data);

export const fetchRuns = () =>
  api.get('/ingestion/runs').then((r) => r.data);