import axiosClient from './axiosClient';

const tableApi = {
  // 1. Lấy danh sách bàn (có filter/sort)
  // URL thực tế: http://localhost:5000/api/admin/tables
  getAll: (params) => {
    return axiosClient.get('/tables', { params });
  },

  // 2. Lấy danh sách khu vực (Location)
  // URL thực tế: http://localhost:5000/api/admin/tables/locations
  getLocations: () => {
    return axiosClient.get('/tables/locations');
  },

  // 3. Tạo bàn mới
  create: (data) => {
    return axiosClient.post('/tables', data);
  },

  // 4. Cập nhật bàn
  update: (id, data) => {
    return axiosClient.put(`/tables/${id}`, data);
  },

  // 5. Tạo QR Code (Lưu ý: Backend bạn dùng route /generate)
  generateQR: (id) => {
    return axiosClient.post(`/tables/${id}/qr/generate`);
  },

  // 6. Regenerate All QR (Làm mới tất cả)
  regenerateAll: () => {
    return axiosClient.post('/tables/qr/regenerate-all');
  },

  // 7. URL Download (Dùng cho window.location.href, không gọi qua axios)
  DOWNLOAD_ALL_URL: 'http://localhost:5000/api/admin/tables/qr/download-all',
  DOWNLOAD_PDF_URL: 'http://localhost:5000/api/admin/tables/qr/download-pdf',
};

export default tableApi;