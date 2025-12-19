import axiosClient from './axiosClient';

const BASE_ADMIN_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/admin` 
  : 'http://localhost:5000/api/admin';

const tableApi = {
  getAll: (params) => {
    return axiosClient.get('/tables', { params });
  },

  getLocations: () => {
    return axiosClient.get('/tables/locations');
  },

  create: (data) => {
    return axiosClient.post('/tables', data);
  },

  update: (id, data) => {
    return axiosClient.put(`/tables/${id}`, data);
  },

  generateQR: (id) => {
    return axiosClient.post(`/tables/${id}/qr/generate`);
  },

  regenerateAll: () => {
    return axiosClient.post('/tables/qr/regenerate-all');
  },

  DOWNLOAD_ALL_URL: `${BASE_ADMIN_URL}/tables/qr/download-all`,
  DOWNLOAD_PDF_URL: `${BASE_ADMIN_URL}/tables/qr/download-pdf`,
};

export default tableApi;