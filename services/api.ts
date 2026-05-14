import axios from 'axios';

const EDGE_FUNCTION_BASE_URL = 'https://dobpdssgdfaiharnmpdf.supabase.co/functions/v1/admin-api/';

const smoothInstance = axios.create({
  baseURL: EDGE_FUNCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
});

smoothInstance.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('supabase-token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic CRUD factory
const createCrud = (resource: string) => ({
  getAll: (params?: any) => smoothInstance.get(`${resource}`, { params }).then(res => res.data),
  getOne: (id: string) => smoothInstance.get(`${resource}`, { params: { id } }).then(res => res.data),
  create: (data: any) => smoothInstance.post(`${resource}`, data).then(res => res.data),
  update: (id: string, data: any) => smoothInstance.put(`${resource}`, { ...data }, { params: { id } }).then(res => res.data),
  delete: (id: string) => smoothInstance.delete(`${resource}`, { params: { id } }).then(res => res.data),
});

export const authApi = {
  login: (data: any) => smoothInstance.post('/login', data).then(res => res.data),
};

export const categoriesApi = createCrud('categories');
export const reportItemsApi = createCrud('report-items');
export const vesselsApi = {
  ...createCrud('vessels'),
  getStats: () => smoothInstance.get('/vessels?stats=true').then(res => res.data),
};
export const reportsApi = createCrud('reports');
export const usersApi = createCrud('users');

// Legacy support for 51 tables
export const getTableData = (tableName: string, params?: any) => smoothInstance.get(`/${tableName}`, { params }).then(res => res.data);
export const updateTableRow = (tableName: string, id: string, data: any) => smoothInstance.put(`/${tableName}`, data, { params: { id } }).then(res => res.data);

export default smoothInstance;
