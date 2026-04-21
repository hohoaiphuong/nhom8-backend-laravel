import client from './client';

export const addressApi = {
  // Lấy danh sách địa chỉ của user
  getAddresses: () => client.get('/addresses'),

  // Thêm địa chỉ mới
  addAddress: (data) => client.post('/addresses', data),

  // Cập nhật địa chỉ
  updateAddress: (id, data) => client.put(`/addresses/${id}`, data),

  // Xóa địa chỉ
  deleteAddress: (id) => client.delete(`/addresses/${id}`),

  // Đặt địa chỉ mặc định
  setDefaultAddress: (id) => client.post(`/addresses/${id}/set-default`),
};
